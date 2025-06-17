import { Model } from 'mongoose';
import { toObjectId } from 'src/common/utils';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { UploadService } from 'src/upload/upload.service';
import { Attachment, AttachmentDocument } from './attachment.model';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectModel(Attachment.name)
    private readonly attachmentModel: Model<AttachmentDocument>,
    private readonly uploadService: UploadService,
  ) {}

  async uploadAttachment(
    files: Express.Multer.File[],
    ownerId: string,
    ownerType: 'Post' | 'Library',
    uploadedBy: string,
  ): Promise<Attachment[]> {
    const attachments: Attachment[] = [];
    for (const file of files) {
      let uploadUrl: string;

      // Check if the file is an image
      if (file.mimetype.startsWith('image/')) {
        const response = await this.uploadService.uploadToCloudinary(file);
        uploadUrl = response.url || response.secure_url;
      } else {
        uploadUrl = await this.uploadService.uploadToFirebase(file);
      }

      const attachmentDoc = await this.attachmentModel.insertOne({
        originalname: file.originalname,
        url: uploadUrl, // Use the dynamically determined upload URL
        fileType: file.mimetype,
        size: file.size,
        ownerId: toObjectId(ownerId),
        ownerType,
        uploadedBy: toObjectId(uploadedBy),
      });
      // Convert the document to a plain object
      attachments.push(attachmentDoc.toObject());
    }
    return attachments;
  }

  async deleteAll({
    ownerId,
    ownerType,
  }: {
    ownerId: string;
    ownerType: 'Post' | 'Library';
  }) {
    return await this.attachmentModel.deleteMany({ ownerId, ownerType });
  }

  async findAttachmentById(id: string) {
    return await this.attachmentModel
      .findById(toObjectId(id))
      .populate('ownerId');
  }
  async findAndDeleteAttachmentById(id: string) {
    return await this.attachmentModel.findByIdAndDelete(toObjectId(id));
  }
  async getByOwnerId({
    ownerId,
    ownerType,
    filter,
    pagination,
  }: {
    ownerId: string;
    ownerType: 'Post' | 'Library';
    filter: object;
    pagination: {
      limit: number;
      page: number;
    };
  }) {
    return this.attachmentModel
      .find({ ownerId: toObjectId(ownerId), ownerType, ...filter })
      .populate({
        path: 'uploadedBy',
        select: 'name email _id avatar',
      })
      .limit(pagination.limit)
      .skip((pagination.page - 1) * pagination.limit)
      .exec();
  }
}
