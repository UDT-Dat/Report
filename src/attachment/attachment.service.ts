import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attachment, AttachmentDocument } from './attachment.model';
import { toObjectId } from 'src/common/utils';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectModel(Attachment.name)
    private attachmentModel: Model<AttachmentDocument>,
  ) {}

  async uploadAttachment(
    files: Express.Multer.File[],
    ownerId: string,
    ownerType: 'Post' | 'Library',
    uploadedBy: string,
  ): Promise<Attachment[]> {
    const attachments = await this.attachmentModel.insertMany(
      files.map((file) => {
        return {
          originalname: file.originalname,
          url: file.path,
          fileType: file.mimetype,
          size: file.size,
          ownerId: toObjectId(ownerId),
          ownerType,
          uploadedBy: toObjectId(uploadedBy),
        };
      }),
    );
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
  async getByOwerId({
    ownerId,
    ownerType,
    filter,
    pagination,
  }: {
    ownerId: string;
    ownerType: 'Post' | 'Library';
    filter: object;
    pagination: {
      size: number;
      page: number;
    };
  }) {
    return this.attachmentModel
      .find({ ownerId: toObjectId(ownerId), ownerType, ...filter })
      .populate({
        path: 'uploadedBy',
        select: 'name email _id',
      })
      .limit(pagination.size)
      .skip((pagination.page - 1) * pagination.size)
      .exec();
  }
}
