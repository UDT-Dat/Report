import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument, UserRole, UserStatus } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import convertParam from 'src/common/utils/convert-params';
import { getInfoData } from 'src/common/utils';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationService: NotificationService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    currentUser?: User,
  ): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
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

  async findAll(query: object): Promise<User[]> {
    const { result: filter, errors, pagination } = convertParam(query);
    if (errors.length > 0) {
      throw new BadRequestException(errors.join('.'));
    }
    return this.userModel
      .find(filter)
      .select(['-password', '-__v'])
      .limit(pagination.size)
      .skip((pagination.page - 1) * pagination.size)
      .lean();
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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
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

    user.role = UserRole.MENTOR;
    return user.save();
  }
}
