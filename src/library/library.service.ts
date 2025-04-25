import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../auth/user.model';
import { v4 as uuidv4 } from 'uuid';
import { Library, LibraryDocument } from './models/library.model';
import { Permission, PermissionDocument, PermissionType } from './models/permission.model';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UserRole } from '../user/user.model';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { toObjectId } from 'src/common/utils';
import convertParam from 'src/common/utils/convert-params';
import { AttachmentService } from 'src/attachment/attachment.service';
import { Attachment } from 'src/attachment/attachment.model';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(Library.name) private libraryModel: Model<LibraryDocument>,
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    private attachmentService: AttachmentService,
    private notificationService: NotificationService
  ) { }

  async createLibrary(createLibraryDto: CreateLibraryDto, user: User): Promise<Library> {
    // Only admin can create libraries
    if (![UserRole.ADMIN, UserRole.MENTOR].includes(user.role as UserRole)) {
      throw new ForbiddenException('Only administrators can create libraries');
    }

    try {
      const library = new this.libraryModel({
        ...createLibraryDto,
        createdBy: user.userId,
        lastUpdateBy: user.userId,
      });

      return await library.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to create library');
    }
  }

  async findAllLibraries(user: User): Promise<Library[]> {
    try {
      const isAdmin = [UserRole.ADMIN, UserRole.MENTOR].includes(user.role as UserRole);

      // If user is admin,mentor return all libraries
      if (isAdmin) {
        return this.libraryModel.find().populate({
          path: 'createdBy',
          select: 'name email _id'
        }).exec();
      }

      // Get libraries user has permission to access
      const permissions = await this.permissionModel.find({ user: toObjectId(user.userId) }).distinct('library');

      // Find all libraries that are either public or user has permission to
      return this.libraryModel.find({
        $or: [
          { isPublic: true },
          { _id: { $in: permissions } },
          { createdBy: user.userId } // User's own libraries
        ]
      }).populate({
        path: 'createdBy',
        select: 'name email _id'
      }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch libraries');
    }
  }

  async findLibraryById(id: string, user: User): Promise<Library> {
    try {
      const library = await this.libraryModel.findById(id).populate({
        path: 'createdBy',
        select: 'name email _id'
      }).exec();

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      const isAdmin = [UserRole.ADMIN, UserRole.MENTOR].includes(user.role as UserRole);
      const isCreator = library.createdBy.toString() === user.userId.toString();

      // Check if user can access this library
      if (isAdmin || isCreator) {
        return library;
      }

      // Check if user has permission
      const permission = await this.permissionModel.findOne({
        library: library._id,
        user: toObjectId(user.userId)
      });

      if (!permission) {
        throw new ForbiddenException('You do not have permission to access this library');
      }

      return library;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch library');
    }
  }

  async updateLibrary(id: string, updateLibraryDto: UpdateLibraryDto, user: User): Promise<Library> {
    try {
      const library = await this.libraryModel.findById(id);

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      const isAdmin = [UserRole.ADMIN, UserRole.MENTOR].includes(user.role as UserRole);
      const isCreator = library.createdBy.toString() === user.userId.toString();

      if (!isAdmin && !isCreator) {
        throw new ForbiddenException('You do not have permission to update this library');
      }

      const updatedLibrary = await this.libraryModel
        .findByIdAndUpdate(id, { ...updateLibraryDto, lastUpdateBy: toObjectId(user.userId) }, { new: true })
        .populate({
          path: 'createdBy',
          select: 'name email _id'
        })
        .exec();

      if (!updatedLibrary) {
        throw new NotFoundException('Library not found after update');
      }

      return updatedLibrary;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update library');
    }
  }

  async deleteLibrary(id: string, user: User): Promise<void> {
    try {
      const library = await this.libraryModel.findById(id);

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      const isAdmin = user.role === UserRole.ADMIN;
      const isCreator = library.createdBy.toString() === user.userId.toString();

      if (!isAdmin && !isCreator) {
        throw new ForbiddenException('You do not have permission to delete this library');
      }

      // Delete the library
      await this.libraryModel.findByIdAndDelete(id);

      // Delete all associated attachments
      await this.attachmentService.deleteAll({ ownerId: id, ownerType: 'Library' });

      // Delete all associated permissions
      await this.permissionModel.deleteMany({ library: id });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete library');
    }
  }

  // Attachment methods

  async uploadAttachment({ files, libraryId, user }:
    {
      files: Express.Multer.File[],
      user: any, libraryId: string
    }): Promise<Attachment[]> {
    try {
      const library = await this.libraryModel.findById(libraryId);

      if (!library) {
        throw new NotFoundException('Library not found');
      }
      const hasPermission = await this.permissionModel.findOne({
        library: toObjectId(libraryId),
        user: toObjectId(user.userId)
      }).lean()
      if(!hasPermission){
        throw new ForbiddenException("You don't have permision for resource")
      }

      const attachments = await this.attachmentService.uploadAttachment(files, libraryId, 'Library', user.userId)

      return attachments;
    } catch (error) {
      console.log(error)
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload attachment');
    }
  }

  async getAttachmentsByLibrary(libraryId: string, query: object, user: User): Promise<Attachment[]> {
    try {
      await this.findLibraryById(toObjectId(libraryId), user);
      const { result: filter, errors, pagination } = convertParam(query)
      // First check if user has access to the library
      if (errors.length > 0) {
        throw new BadRequestException(errors.join("."))
      }

      // Then return all attachments for that library
      return this.attachmentService.getByOwerId({
        ownerId: libraryId,
        ownerType: 'Library',
        filter,
        pagination
      })
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
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
      const isAdmin = user.role === UserRole.ADMIN;

      // Owner of the attachment can delete their own uploads
      const isUploader = attachment.uploadedBy.toString() === user.userId.toString();

      // Creator of the library can delete any attachment in their library
      const isLibraryCreator = library.createdBy.toString() === user.userId.toString();

      if (!isAdmin && !isUploader && !isLibraryCreator) {
        throw new ForbiddenException('You do not have permission to delete this attachment. Only the owner of the attachment, library creator, or administrators can delete attachments.');
      }

      return await this.attachmentService.findAndDeleteAttachmentById(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete attachment');
    }
  }

  // Permission methods

  async createPermission(createPermissionDto: CreatePermissionDto, libraryId: string, user: User): Promise<Permission> {
    try {
      const library = await this.libraryModel.findById(toObjectId(libraryId)).lean();

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      // Only admin or library creator can manage permissions
      const isAdmin = user.role === UserRole.ADMIN;
      const isCreator = library.createdBy.toString() === user.userId.toString();

      if (!isAdmin && !isCreator) {
        throw new ForbiddenException('Only administrators and library creators can manage permissions.');
      }

      // Check if permission already exists
      const existingPermission = await this.permissionModel.findOne({
        library: toObjectId(libraryId),
        user: toObjectId(createPermissionDto.userId)
      });
      if (existingPermission) {
        throw new BadRequestException('Permission already exists');
      }


      // Create new permission
      const permission = await this.permissionModel.create({
        library: toObjectId(libraryId),
        user: toObjectId(createPermissionDto.userId),
        grantedBy: toObjectId(user.userId)
      });

      const permissionExtend = await permission.populate<{ user: User }>("user");
      const populatedUser = permissionExtend.user as unknown as User;

      this.notificationService.createLibraryAccessNotification(libraryId, library.title, populatedUser)

      return permission;
    } catch (error) {
      console.log(error)
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create permission');
    }
  }

  async getPermissionsByLibrary(libraryId: string, user: User): Promise<Permission[]> {
    try {
      const library = await this.libraryModel.findById(toObjectId(libraryId));

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      const isAdmin = user.role === UserRole.ADMIN;
      const isCreator = library.createdBy.toString() === user.userId.toString();

      // Only library creator and admin can view permissions
      if (!isAdmin && !isCreator) {
        throw new ForbiddenException('Only administrators and library creators can view permissions for this library');
      }

      return this.permissionModel.find({ library: toObjectId(libraryId) })
        .populate({
          path: 'user',
          select: 'name email _id'
        })
        .populate({
          path: 'grantedBy',
          select: 'name email _id'
        })
        .exec();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch permissions');
    }
  }

  async deletePermission(id: string, user: User): Promise<Permission | null> {
    try {
      const permission = await this.permissionModel.findById(id).populate('library');

      if (!permission) {
        throw new NotFoundException('Permission not found');
      }

      const library = await this.libraryModel.findById(permission.library);

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      const isAdmin = user.role === UserRole.ADMIN;
      const isCreator = library.createdBy.toString() === user.userId.toString();

      // Only library creator and admin can delete permissions
      if (!isAdmin && !isCreator) {
        throw new ForbiddenException('Only administrators and library creators can manage permissions');
      }

      return await this.permissionModel.findByIdAndDelete(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete permission');
    }
  }


}
