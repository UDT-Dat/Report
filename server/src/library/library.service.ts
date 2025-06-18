import { Model } from 'mongoose';
import { Attachment } from 'src/attachment/attachment.model';
import { AttachmentService } from 'src/attachment/attachment.service';
import { toObjectId } from 'src/common/utils';
import convertParam from 'src/common/utils/convert-params';
import { LibraryListResponseDto } from 'src/library/dto/list-library.dto';
import { NotificationService } from 'src/notification/notification.service';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument, UserRole } from '../user/user.model';
import { CreateLibraryDto } from './dto/create-library.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import {
  GetLibraryUsersDto,
  LibraryUsersResponseDto,
  UserParticipationStatus,
} from './dto/get-library-users.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { Library, LibraryDocument } from './models/library.model';
import { Permission, PermissionDocument } from './models/permission.model';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(Library.name)
    private readonly libraryModel: Model<LibraryDocument>,
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<PermissionDocument>,
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    private readonly attachmentService: AttachmentService,
    private readonly notificationService: NotificationService,
  ) {}

  async createLibrary(
    createLibraryDto: CreateLibraryDto,
    user: User,
  ): Promise<Library> {
    try {
      const library = new this.libraryModel({
        ...createLibraryDto,
        createdBy: user.userId,
        lastUpdateBy: user.userId,
      });

      return await library.save();
    } catch {
      throw new InternalServerErrorException('Failed to create library');
    }
  }

  async findAllLibraries(
    user: User,
    query: object,
  ): Promise<LibraryListResponseDto> {
    const { result: filter, errors, pagination } = convertParam(query);
    try {
      if (errors.length > 0) {
        throw new BadRequestException(errors.join('; '));
      }
      const isAdmin = [UserRole.ADMIN, UserRole.BOD].includes(user.role);

      if (isAdmin) {
        const [result] = await this.libraryModel.aggregate([
          {
            $match: {
              ...filter,
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'createdBy',
              foreignField: '_id',
              as: 'createdBy',
            },
          },
          {
            $unwind: '$createdBy',
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
              libraries: [
                {
                  $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    createdBy: {
                      _id: '$createdBy._id',
                      name: '$createdBy.name',
                      email: '$createdBy.email',
                      avatar: '$createdBy.avatar',
                    },
                    createdAt: 1,
                    updatedAt: 1,
                  },
                },
              ],
            },
          },
        ]);
        return {
          libraries: result.libraries,
          pagination: {
            total: result.metadata[0].total || 0,
            page: result.metadata[0].page || 1,
            limit: result.metadata[0].limit || 10,
          },
        };
      }

      // Get libraries user has permission to access
      const permissions = await this.permissionModel
        .find({ user: toObjectId(user.userId) })
        .distinct('library');
      const [result] = await this.libraryModel.aggregate([
        {
          $match: {
            $or: [{ _id: { $in: permissions } }, { createdBy: user.userId }],
          },
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
            libraries: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'createdBy',
                  foreignField: '_id',
                  as: 'createdBy',
                },
              },
              {
                $unwind: '$createdBy',
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  description: 1,
                  createdBy: {
                    _id: '$createdBy._id',
                    name: '$createdBy.name',
                    email: '$createdBy.email',
                    avatar: '$createdBy.avatar',
                  },
                  createdAt: 1,
                  updatedAt: 1,
                },
              },
            ],
          },
        },
      ]);
      return {
        libraries: result.libraries,
        pagination: {
          total: result.metadata[0].total || 0,
          page: result.metadata[0].page || 1,
          limit: result.metadata[0].limit || 10,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch libraries');
    }
  }

  async findLibraryById(id: string, user: User): Promise<Library> {
    try {
      const library = await this.libraryModel
        .findById(id)
        .populate({
          path: 'createdBy',
          select: 'name email _id avatar',
        })
        .lean();

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      const isAdmin = [UserRole.ADMIN, UserRole.BOD].includes(user.role);
      const isCreator = library.createdBy.toString() === user.userId.toString();

      // Check if user can access this library
      if (isAdmin || isCreator) {
        return library;
      }

      // Check if user has permission
      const permission = await this.permissionModel.findOne({
        library: library._id,
        user: toObjectId(user.userId),
      });

      if (!permission) {
        throw new ForbiddenException(
          'You do not have permission to access this library',
        );
      }

      return library;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch library');
    }
  }

  async updateLibrary(
    id: string,
    updateLibraryDto: UpdateLibraryDto,
    user: User,
  ): Promise<Library> {
    try {
      const library = await this.libraryModel.findById(id);

      if (!library) {
        throw new NotFoundException('Library not found');
      }
      const isCreator = library.createdBy.toString() === user.userId.toString();
      if (!isCreator) {
        throw new ForbiddenException(
          'You do not have permission to update this library',
        );
      }

      const updatedLibrary = await this.libraryModel
        .findByIdAndUpdate(
          id,
          { ...updateLibraryDto, lastUpdateBy: toObjectId(user.userId) },
          { new: true },
        )
        .populate({
          path: 'createdBy',
          select: 'name email _id',
        })
        .lean();

      if (!updatedLibrary) {
        throw new NotFoundException('Library not found after update');
      }

      return updatedLibrary;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update library');
    }
  }

  async deleteLibrary(id: string, user: User): Promise<Library> {
    try {
      const library = await this.libraryModel.findById(id);

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      const isCreator = library.createdBy.toString() === user.userId.toString();

      if (!isCreator) {
        throw new ForbiddenException(
          'You do not have permission to delete this library',
        );
      }

      // Delete the library
      await this.libraryModel.findByIdAndDelete(id);

      // Delete all associated attachments
      await this.attachmentService.deleteAll({
        ownerId: id,
        ownerType: 'Library',
      });

      // Delete all associated permissions
      await this.permissionModel.deleteMany({ library: id });
      return library;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete library');
    }
  }

  // Attachment methods

  async uploadAttachment({
    files,
    libraryId,
    user,
  }: {
    files: Express.Multer.File[];
    user: any;
    libraryId: string;
  }): Promise<Attachment[]> {
    try {
      const library = await this.libraryModel.findById(libraryId);

      if (!library) {
        throw new NotFoundException('Library not found');
      }
      const isMentor = [UserRole.BOD, UserRole.ADMIN].includes(
        user.role as UserRole,
      );
      const hasPermission = await this.permissionModel
        .findOne({
          library: toObjectId(libraryId),
          user: toObjectId(user.userId as string),
        })
        .lean();
      if (!hasPermission && !isMentor) {
        throw new ForbiddenException("You don't have permission for resource");
      }

      const attachments = await this.attachmentService.uploadAttachment(
        files,
        libraryId,
        'Library',
        user.userId as string,
      );

      return attachments;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload attachment');
    }
  }

  async getAttachmentsByLibrary(
    libraryId: string,
    query: object & {
      fileType?: 'document' | 'image' | 'video' | 'audio' | 'other';
    },
    user: User,
  ): Promise<{ attachments: Attachment[]; library: Library }> {
    try {
      const library = await this.findLibraryById(toObjectId(libraryId), user);
      const { result: filter, errors, pagination } = convertParam(query);
      if (errors.length > 0) {
        throw new BadRequestException(errors.join('.'));
      }
      const fileTypeQuery = this.getQueryByFileType(
        query?.fileType as 'document' | 'image' | 'video' | 'audio' | 'other',
      );

      // Then return all attachments for that library
      return {
        attachments: await this.attachmentService.getByOwnerId({
          ownerId: libraryId,
          ownerType: 'Library',
          filter: { ...filter, ...fileTypeQuery },
          pagination,
        }),
        library,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch attachments');
    }
  }

  async deleteAttachment(id: string, user: User): Promise<Attachment | null> {
    try {
      const attachment = await this.attachmentService.findAttachmentById(id);

      if (!attachment) {
        throw new NotFoundException('Attachment not found');
      }

      const library = await this.libraryModel.findById(attachment.ownerId);

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      // Admin can delete any attachment
      const isMentor = user.role === UserRole.BOD || user.role === UserRole.ADMIN;

      // Owner of the attachment can delete their own uploads
      const isUploader =
        attachment.uploadedBy.toString() === user.userId.toString();

      // Creator of the library can delete any attachment in their library
      const isLibraryCreator =
        library.createdBy.toString() === user.userId.toString();

      if (!isMentor && !isUploader && !isLibraryCreator) {
        throw new ForbiddenException(
          'You do not have permission to delete this attachment. Only the owner of the attachment, library creator can delete attachments.',
        );
      }

      return await this.attachmentService.findAndDeleteAttachmentById(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete attachment');
    }
  }

  // Permission methods

  async createPermission(
    createPermissionDto: CreatePermissionDto,
    libraryId: string,
    user: User,
  ): Promise<Permission> {
    try {
      const library = await this.libraryModel
        .findById(toObjectId(libraryId))
        .lean();

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      // Only admin or library creator can manage permissions
      const isMentor = user.role === UserRole.BOD || user.role === UserRole.ADMIN;
      const isCreator = library.createdBy.toString() === user.userId.toString();

      if (!isMentor && !isCreator) {
        throw new ForbiddenException(
          'Only mentors and library creators can manage permissions.',
        );
      }

      // Check if permission already exists
      const existingPermission = await this.permissionModel.findOne({
        library: toObjectId(libraryId),
        user: toObjectId(createPermissionDto.userId),
      });
      if (existingPermission) {
        throw new BadRequestException('Permission already exists');
      }

      // Create new permission
      const permission = await this.permissionModel.create({
        library: toObjectId(libraryId),
        user: toObjectId(createPermissionDto.userId),
        grantedBy: toObjectId(user.userId),
      });

      const permissionExtend = await permission.populate<{ user: User }>(
        'user',
      );
      const populatedUser = permissionExtend.user as unknown as User;

      this.notificationService.createLibraryAccessNotification(
        libraryId,
        library.title,
        populatedUser,
      );

      return permission;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create permission');
    }
  }

  async getPermissionsByLibrary(
    libraryId: string,
    user: User,
  ): Promise<Permission[]> {
    try {
      const library = await this.libraryModel.findById(toObjectId(libraryId));

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      const isMentor = user.role === UserRole.BOD || user.role === UserRole.ADMIN;
      const isCreator = library.createdBy.toString() === user.userId.toString();

      // Only library creator and admin can view permissions
      if (!isMentor && !isCreator) {
        throw new ForbiddenException(
          'Only mentors and library creators can view permissions for this library',
        );
      }

      return this.permissionModel
        .find({ library: toObjectId(libraryId) })
        .populate({
          path: 'user',
          select: 'name email _id',
        })
        .populate({
          path: 'grantedBy',
          select: 'name email _id',
        })
        .lean();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch permissions');
    }
  }

  async deletePermission(id: string, user: User): Promise<Permission | null> {
    try {
      const permission = await this.permissionModel
        .findById(id)
        .populate('library')
        .lean();

      if (!permission) {
        throw new NotFoundException('Permission not found');
      }

      const library = await this.libraryModel.findById(permission.library);

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      const isMentor = user.role === UserRole.BOD || user.role === UserRole.ADMIN;
      const isCreator = library.createdBy.toString() === user.userId.toString();

      // Only library creator and admin can delete permissions
      if (!isMentor && !isCreator) {
        throw new ForbiddenException(
          'Only mentors and library creators can manage permissions',
        );
      }

      return await this.permissionModel.findByIdAndDelete(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete permission');
    }
  }
  // Library Users Management methods

  async getLibraryUsers(
    libraryId: string,
    query: GetLibraryUsersDto,
    user: User,
  ): Promise<LibraryUsersResponseDto> {
    try {
      const library = await this.libraryModel.findById(toObjectId(libraryId));
      if (!library) {
        throw new NotFoundException('Library not found');
      }

      const isMentor =
        user.role === UserRole.BOD || user.role === UserRole.ADMIN;
      const isCreator = library.createdBy.toString() === user.userId.toString();

      // Only library creator and admin can view users
      if (!isMentor && !isCreator) {
        throw new ForbiddenException(
          'Only mentors and library creators can view users for this library',
        );
      }

      const { page = 1, limit = 10, search, status } = query;
      const skip = (page - 1) * limit;

      // Build search criteria
      const searchCriteria: any = {};
      if (search) {
        searchCriteria.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      // Get all users based on search criteria
      const allUsers = await this.userModel
        .find({
          ...searchCriteria,
          role: UserRole.MEMBER,
        })
        .select('name email avatar role')
        .lean();

      // Get permissions for this library
      const permissions = await this.permissionModel
        .find({ library: toObjectId(libraryId) })
        .populate({
          path: 'grantedBy',
          select: 'name email _id',
        })
        .lean();

      // Create a map of user permissions
      const permissionMap = new Map();
      permissions.forEach((perm) => {
        permissionMap.set(perm.user.toString(), perm);
      });

      // Combine users with their permission status
      let usersWithAccess = allUsers.map((user) => {
        const permission = permissionMap.get(user._id.toString());
        return {
          ...user,
          hasAccess: !!permission,
          permission: permission
            ? {
                _id: permission._id,
                grantedBy: permission.grantedBy,
                createdAt: permission.createdAt,
              }
            : undefined,
        };
      });

      // Filter by status if specified
      if (status) {
        if (status === UserParticipationStatus.GRANTED) {
          usersWithAccess = usersWithAccess.filter((user) => user.hasAccess);
        } else if (status === UserParticipationStatus.NOT_GRANTED) {
          usersWithAccess = usersWithAccess.filter((user) => !user.hasAccess);
        }
      }

      // Apply pagination
      const total = usersWithAccess.length;
      const paginatedUsers = usersWithAccess.slice(skip, skip + limit);

      return {
        users: paginatedUsers,
        pagination: {
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch library users');
    }
  }

  async grantLibraryAccess(
    libraryId: string,
    userId: string,
    user: User,
  ): Promise<Permission> {
    try {
      const library = await this.libraryModel.findById(toObjectId(libraryId));

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      const targetUser = await this.userModel.findById(toObjectId(userId));

      if (!targetUser) {
        throw new NotFoundException('User not found');
      }

      const isCreator = library.createdBy.toString() === user.userId.toString();

      // Only library creator and admin can grant access
      if (!isCreator) {
        throw new ForbiddenException(
          'Only mentors and library creators can grant access to this library',
        );
      }

      // Check if permission already exists
      const existingPermission = await this.permissionModel.findOne({
        library: toObjectId(libraryId),
        user: toObjectId(userId),
      });

      if (existingPermission) {
        throw new BadRequestException(
          'User already has access to this library',
        );
      }

      // Create new permission
      const permission = await this.permissionModel.create({
        library: toObjectId(libraryId),
        user: toObjectId(userId),
        grantedBy: toObjectId(user.userId),
      });

      // Send notification
      void this.notificationService.createLibraryAccessNotification(
        libraryId,
        library.title,
        targetUser,
      );

      return permission;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to grant library access');
    }
  }

  async revokeLibraryAccess(
    libraryId: string,
    userId: string,
    user: User,
  ): Promise<{ message: string; permission: Permission }> {
    try {
      const library = await this.libraryModel.findById(toObjectId(libraryId));

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      const isCreator = library.createdBy.toString() === user.userId.toString();

      // Only library creator and admin can revoke access
      if (!isCreator) {
        throw new ForbiddenException(
          'Only mentors and library creators can revoke access to this library',
        );
      }

      // Find and delete the permission
      const permission = await this.permissionModel.findOneAndDelete({
        library: toObjectId(libraryId),
        user: toObjectId(userId),
      });

      if (!permission) {
        throw new NotFoundException('Permission not found');
      }

      await this.notificationService.createLibraryRevokeAccessNotification(
        libraryId,
        library.title,
        permission.user,
      );

      return {
        message: 'Permission revoked successfully',
        permission,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to revoke library access');
    }
  }

  private getQueryByFileType(
    type: 'document' | 'image' | 'video' | 'audio' | 'other',
  ) {
    switch (type) {
      case 'document':
        return {
          fileType: {
            $in: [
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ],
          },
        };
      case 'image':
        return {
          fileType: {
            $in: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
          },
        };
      case 'video':
        return {
          fileType: {
            $in: [
              'video/mp4',
              'video/mpeg',
              'video/mpg',
              'video/avi',
              'video/mov',
              'video/wmv',
              'video/flv',
              'video/webm',
            ],
          },
        };
      case 'audio':
        return {
          fileType: {
            $in: [
              'audio/mpeg',
              'audio/mp3',
              'audio/mpga',
              'audio/m4a',
              'audio/wav',
              'audio/webm',
            ],
          },
        };
      case 'other':
        return {
          fileType: {
            $nin: [
              'application/pdf',
              'image/jpeg',
              'image/png',
              'video/mp4',
              'audio/mpeg',
            ],
          },
        };
      default:
        return {};
    }
  }
}
