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
import { Attachment, AttachmentDocument } from './models/attachment.model';
import { Permission, PermissionDocument, PermissionType } from './models/permission.model';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UserRole } from '../user/user.model';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(Library.name) private libraryModel: Model<LibraryDocument>,
    @InjectModel(Attachment.name) private attachmentModel: Model<AttachmentDocument>,
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
  ) { }

  async createLibrary(createLibraryDto: CreateLibraryDto, user: User): Promise<Library> {
    // Only admin can create libraries
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can create libraries');
    }

    try {
      const library = new this.libraryModel({
        ...createLibraryDto,
        createdBy: user.userId,
      });

      return await library.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to create library');
    }
  }

  async findAllLibraries(user: User): Promise<Library[]> {
    try {
      const isAdmin = user.role === UserRole.ADMIN;

      // If user is admin, return all libraries
      if (isAdmin) {
        return this.libraryModel.find().populate({
          path: 'createdBy',
          select: 'name email _id'
        }).exec();
      }

      // Get libraries user has permission to access
      const permissions = await this.permissionModel.find({ user: user.userId }).distinct('library');

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

      const isAdmin = user.role === UserRole.ADMIN;
      const isCreator = library.createdBy.toString() === user.userId.toString();

      // Check if user can access this library
      if (isAdmin || isCreator) {
        return library;
      }

      // Check if user has permission
      const permission = await this.permissionModel.findOne({
        library: library._id,
        user: user.userId
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

      const isAdmin = user.role === UserRole.ADMIN;
      const isCreator = library.createdBy.toString() === user.userId.toString();

      if (!isAdmin && !isCreator) {
        throw new ForbiddenException('You do not have permission to update this library');
      }

      const updatedLibrary = await this.libraryModel
        .findByIdAndUpdate(id, updateLibraryDto, { new: true })
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
      await this.attachmentModel.deleteMany({ library: id });

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

  async uploadAttachment(
    file: Express.Multer.File,
    createAttachmentDto: CreateAttachmentDto,
    user: User,
  ): Promise<Attachment> {
    try {
      const library = await this.libraryModel.findById(createAttachmentDto.libraryId);

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      const isAdmin = user.role === UserRole.ADMIN;
      const isCreator = library.createdBy.toString() === user.userId.toString();

      // Check if user has write permission
      const hasWritePermission = await this.permissionModel.findOne({
        library: library._id,
        user: user.userId,
        type: { $in: [PermissionType.WRITE, PermissionType.ADMIN] }
      });

      // Only library creator, admin, or users with write permission can upload
      if (!isAdmin && !isCreator && !hasWritePermission) {
        throw new ForbiddenException('You do not have permission to upload to this library');
      }

      const attachment = new this.attachmentModel({
        originalname: file.originalname,
        url: file.path,
        fileType: file.mimetype,
        size: file.size,
        library: new Types.ObjectId(createAttachmentDto.libraryId),
        uploadedBy: user.userId,
      });

      return await attachment.save();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload attachment');
    }
  }

  async getAttachmentsByLibrary(libraryId: string, user: User): Promise<Attachment[]> {
    try {
      // First check if user has access to the library
      await this.findLibraryById(libraryId, user);

      // Then return all attachments for that library
      return this.attachmentModel.find({ library: libraryId })
        .populate({
          path: 'uploadedBy',
          select: 'name email _id'
        })
        .exec();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch attachments');
    }
  }

  async deleteAttachment(id: string, user: User): Promise<void> {
    try {
      const attachment = await this.attachmentModel.findById(id).populate('library');

      if (!attachment) {
        throw new NotFoundException('Attachment not found');
      }

      const library = await this.libraryModel.findById(attachment.library);

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

      await this.attachmentModel.findByIdAndDelete(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete attachment');
    }
  }

  // Permission methods

  async createPermission(createPermissionDto: CreatePermissionDto, user: User): Promise<Permission> {
    try {
      const library = await this.libraryModel.findById(createPermissionDto.libraryId);

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
        library: createPermissionDto.libraryId,
        user: createPermissionDto.userId
      });

      // If not admin, restrict to only granting READ permissions
      if (!isAdmin && createPermissionDto.type !== PermissionType.READ) {
        createPermissionDto.type = PermissionType.READ;
      }

      if (existingPermission) {
        // Update the permission instead
        existingPermission.type = createPermissionDto.type;
        return await existingPermission.save();
      }

      // Create new permission
      const permission = new this.permissionModel({
        library: new Types.ObjectId(createPermissionDto.libraryId),
        user: new Types.ObjectId(createPermissionDto.userId),
        type: createPermissionDto.type,
        grantedBy: user.userId
      });

      return await permission.save();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create permission');
    }
  }

  async getPermissionsByLibrary(libraryId: string, user: User): Promise<Permission[]> {
    try {
      const library = await this.libraryModel.findById(libraryId);

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      const isAdmin = user.role === UserRole.ADMIN;
      const isCreator = library.createdBy.toString() === user.userId.toString();

      // Only library creator and admin can view permissions
      if (!isAdmin && !isCreator) {
        throw new ForbiddenException('Only administrators and library creators can view permissions for this library');
      }

      return this.permissionModel.find({ library: libraryId })
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

  async deletePermission(id: string, user: User): Promise<void> {
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

      await this.permissionModel.findByIdAndDelete(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete permission');
    }
  }

  async updatePermission(
    libraryId: string,
    userId: string,
    updatePermissionDto: UpdatePermissionDto,
    user: User
  ): Promise<Permission> {
    try {
      const library = await this.libraryModel.findById(libraryId);

      if (!library) {
        throw new NotFoundException('Library not found');
      }

      // Only admin or library creator can update permissions
      const isAdmin = user.role === UserRole.ADMIN;
      const isCreator = library.createdBy.toString() === user.userId.toString();

      if (!isAdmin && !isCreator) {
        throw new ForbiddenException('Only administrators and library creators can update permissions');
      }

      // Find the existing permission
      const existingPermission = await this.permissionModel.findOne({
        library: libraryId,
        user: userId
      });

      if (!existingPermission) {
        throw new NotFoundException('Permission not found for this user in the library');
      }

      // If not admin and trying to set a higher level than READ, restrict to READ only
      if (!isAdmin && updatePermissionDto.type !== PermissionType.READ) {
        // Only admins can grant WRITE or ADMIN permissions
        if (isCreator) {
          // Library creators can grant up to WRITE permissions
          if (updatePermissionDto.type === PermissionType.ADMIN) {
            updatePermissionDto.type = PermissionType.WRITE;
          }
        } else {
          // Normal users can only grant READ permissions
          updatePermissionDto.type = PermissionType.READ;
        }
      }

      // Update the permission
      existingPermission.type = updatePermissionDto.type;

      // Save the updated permission
      return await existingPermission.save();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update permission');
    }
  }
}
