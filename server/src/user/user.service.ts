import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as ExcelJS from 'exceljs';
import { Model } from 'mongoose';
import { getInfoData } from 'src/common/utils';
import convertParam from 'src/common/utils/convert-params';
import { MailService } from 'src/notification/mail.service';
import { NotificationService } from 'src/notification/notification.service';
import { UploadService } from 'src/upload/upload.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  UpdateUserByIdDto,
  UpdateUserPasswordDto,
} from './dto/update-user.dto';
import { User, UserDocument, UserRole, UserStatus } from './user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
    private readonly uploadService: UploadService,
  ) {}

  async checkStudentCode({
    studentCode,
    userId,
  }: {
    studentCode: string;
    userId: string;
  }): Promise<boolean> {
    const existingUser = await this.userModel.findOne({
      studentCode,
      _id: { $ne: userId }, // Exclude current user
    });

    if (existingUser) {
      throw new ConflictException('Mã sinh viên đã tồn tại trong hệ thống');
    }

    return true;
  }

  async create(
    createUserDto: CreateUserDto,
    currentUser?: User,
  ): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
      status:
        currentUser?.role === UserRole.ADMIN
          ? UserStatus.ACTIVE
          : UserStatus.PENDING,
    });
    return getInfoData(
      ['_id', 'email', 'name', 'role', 'status'],
      user.toObject(),
      '_id',
    ) as User;
  }

  async findAll(query: object): Promise<{
    pagination: {
      total: number;
      page: number;
      limit: number;
    };
    users: User[];
  }> {
    const { result: filter, errors, pagination } = convertParam(query);
    if (errors.length > 0) {
      throw new BadRequestException(errors.join('.'));
    }
    if ('text' in filter) {
      filter['$or'] = [
        { name: { $regex: filter.text, $options: 'i' } },
        { email: { $regex: filter.text, $options: 'i' } },
      ];
      delete filter.text;
    }

    const [result] = await this.userModel.aggregate([
      {
        $match: filter,
      },
      {
        $facet: {
          metadata: [
            {
              $count: 'total',
            },
            {
              $addFields: {
                page: pagination.page,
                limit: pagination.limit,
              },
            },
          ],
          data: [
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                role: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                avatar: 1,
                coverImage: 1,
                studentCode: 1,
                course: 1,
                studentCard: 1,
                phone: 1,
                address: 1,
              },
            },
            {
              $skip: (pagination.page - 1) * pagination.limit,
            },
            {
              $limit: pagination.limit,
            },
          ],
        },
      },
    ]);

    return {
      pagination: result.metadata[0],
      users: result.data,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .select('-password -__v')
      .lean();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).lean();
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .select('-password -__v')
      .lean();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserByIdDto): Promise<User> {
    const user = await this.userModel.findById(id).select('-password -__v');
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        email: updateUserDto.email,
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }
    const { modifiedCount } = await user
      .updateOne(updateUserDto, { new: true })
      .exec();
    if (!modifiedCount) {
      throw new BadRequestException('Something went wrong');
    }
    return {
      ...user.toObject(),
      ...updateUserDto,
    };
  }

  async remove(id: string): Promise<User> {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async approveUser(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password -__v');
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    user.status = UserStatus.ACTIVE;
    this.notificationService.createAccountApprovedNotification(user);
    return user.save();
  }

  async assignMentor(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password -__v');
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (user.role !== UserRole.MEMBER) {
      throw new ConflictException('Only members can be assigned as mentor');
    }

    user.role = UserRole.BOD;
    return user.save();
  }

  async updateAvatar(
    id: string,
    image: Express.Multer.File,
    type: 'avatar' | 'coverImage',
  ): Promise<User> {
    const uploadResult = await this.uploadService.uploadToCloudinary(image);

    const user = await this.userModel.findById(id).select('-password -__v');
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    if (type === 'avatar') {
      user.avatar = uploadResult.url || uploadResult.secure_url;
    } else if (type === 'coverImage') {
      user.coverImage = uploadResult.url || uploadResult.secure_url;
    }
    return await user.save();
  }

  async updatePassword(
    id: string,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ): Promise<{ message: string; status: 'success' | 'error' }> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy tài khoản `);
    }
    if (
      !(await bcrypt.compare(
        updateUserPasswordDto.currentPassword,
        user.password,
      ))
    ) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }
    if (
      updateUserPasswordDto.newPassword !==
      updateUserPasswordDto.confirmPassword
    ) {
      throw new BadRequestException('Mật khẩu và xác nhận mật khẩu không khớp');
    }
    const hashedPassword = await bcrypt.hash(
      updateUserPasswordDto.newPassword,
      10,
    );
    user.password = hashedPassword;
    await user.save();
    return {
      message: 'Mật khẩu đã được cập nhật thành công',
      status: 'success',
    };
  }

  async updateVerifyStatus(
    id: string,
    status: UserStatus,
    rejectReason?: string,
  ): Promise<User> {
    const user = await this.userModel.findById(id).select('-password -__v');
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    user.status = status;
    user.rejectReason = rejectReason;

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Thông báo về trạng thái xác thực tài khoản',
      html: `
        <p>Chào ${user.name},</p>
        <p>Trạng thái xác thực tài khoản của bạn đã được cập nhật.</p>
        <p>Trạng thái mới: ${status}</p>
        ${rejectReason ? `<p>Lý do từ chối: ${rejectReason}</p>` : ''}
        <p>Trân trọng,</p>
        <p>Đội ngũ hỗ trợ</p>
      `,
    });

    return user.save();
  }

  async generateExcel(filters: {
    search?: string;
    role?: string;
    status?: string;
  }) {
    const match: any = {};

    if (filters.search) {
      match.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.role && filters.role !== 'all') {
      match.role = filters.role;
    }

    if (filters.status && filters.status !== 'all') {
      match.status = filters.status;
    }

    const users = await this.userModel.aggregate([
      { $match: match },

      // Join with reactions
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'user',
          as: 'reactions',
        },
      },
      // Join with comments
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: ' createdBy',
          as: 'comments',
        },
      },
      // Join with event participants
      {
        $lookup: {
          from: 'events',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$userId', '$participants'],
                },
              },
            },
          ],
          as: 'events',
        },
      },
      {
        $addFields: {
          totalInteractions: { $size: '$reactions' },
          totalComments: { $size: '$comments' },
          totalEvents: { $size: '$events' },
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          address: 1,
          role: 1,
          status: 1,
          createdAt: 1,
          lastLogin: 1,
          totalInteractions: 1,
          totalComments: 1,
          totalEvents: 1,
          studentCode: 1,
          course: 1,
          studentCard: 1,
          rejectReason: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    worksheet.columns = [
      { header: 'Tên', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Số điện thoại', key: 'phone', width: 20 },
      { header: 'Địa chỉ', key: 'address', width: 40 },
      { header: 'Vai trò', key: 'role', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Ngày tạo', key: 'createdAt', width: 20 },
      { header: 'Lần truy cập cuối', key: 'lastLogin', width: 20 },
      { header: 'Tổng số tương tác', key: 'totalInteractions', width: 20 },
      { header: 'Tổng số bình luận', key: 'totalComments', width: 20 },
      { header: 'Số sự kiện tham gia', key: 'totalEvents', width: 20 },
      { header: 'Mã sinh viên', key: 'studentCode', width: 20 },
      { header: 'Khóa học', key: 'course', width: 20 },
      { header: 'Thẻ sinh viên', key: 'studentCard', width: 20 },
      { header: 'Lý do từ chối', key: 'rejectReason', width: 40 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    const roleLabels = {
      admin: 'Admin',
      bod: 'BOD',
      member: 'Thành viên',
    };

    const statusLabels = {
      ACTIVE: 'Hoạt động',
      PENDING: 'Chờ duyệt',
      INACTIVE: 'Không hoạt động',
      VERIFYING: 'Đang xác thực',
    };

    users.forEach((user) => {
      worksheet.addRow({
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        address: user.address ?? '',
        role: roleLabels[user.role] ?? user.role ?? '',
        status: statusLabels[user.status] ?? user.status ?? '',
        createdAt: user.createdAt
          ? new Date(user.createdAt as Date).toLocaleDateString('vi-VN')
          : '',
        lastLogin: user.lastLogin
          ? new Date(user.lastLogin as Date).toLocaleDateString('vi-VN')
          : '',
        totalInteractions: Number(user.totalInteractions ?? 0),
        totalComments: Number(user.totalComments ?? 0),
        totalEvents: Number(user.totalEvents ?? 0),
        studentCode: user.studentCode ?? '',
        course: user.course ?? '',
        studentCard: user.studentCard ?? '',
        rejectReason: user.rejectReason ?? '',
      });
    });

    return await workbook.xlsx.writeBuffer();
  }
}
