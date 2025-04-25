import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Post, PostDocument } from './post.model';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../auth/user.model';
import { LibraryService } from '../library/library.service';
import { UserRole } from 'src/user/user.model';
import { AttachmentService } from 'src/attachment/attachment.service';
import { toObjectId } from 'src/common/utils';
import { Attachment } from 'src/attachment/attachment.model';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly acttachmentService: AttachmentService,
  ) { }

  async create(
    createPostDto: CreatePostDto,
    user: User,
    bannerImage: Express.Multer.File,
    attachments?: Express.Multer.File[],
  ): Promise<Post> {
    const post = await this.postModel.create({
      ...createPostDto,
      createdBy: user.userId,
      bannerImage: bannerImage.path,
    });
    if (attachments && attachments.length > 0) {
      post.attachments = await this.acttachmentService.uploadAttachment(
        attachments,
        post._id,
        'Post',
        user.userId,
      );
    }
    return post;
  }

  async findAll(): Promise<Post[]> {
    return this.postModel.find()
      .populate({
        path: 'createdBy',
        select: "-password -__v"
      })
      .exec();
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postModel.findById(id)
      .populate({
        path: 'createdBy',
        select: "name email _id"
      }).populate("attachments")
      .lean();

    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    return post;
  }

  async update(
    id: string,
    user: User,
    updatePostDto: UpdatePostDto,
    bannerImage?: Express.Multer.File,
    attachments?: Express.Multer.File[],
  ): Promise<Post> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    let updateData = { ...updatePostDto, ...(bannerImage ? { bannerImage: bannerImage.path } : {}) };
    console.log(updatePostDto)
    // Handle removal of attachments
    if (updatePostDto.removeAttachments && updatePostDto.removeAttachments.length > 0) {
      for (const attachmentId of updatePostDto.removeAttachments) {
        await this.acttachmentService.findAndDeleteAttachmentById(attachmentId);
      }
    }
    let new_attachments: Attachment[] = []
    // Handle new attachments
    if (attachments && attachments.length > 0) {
      new_attachments = await this.acttachmentService.uploadAttachment(
        attachments,
        post._id,
        'Post',
        user.userId,
      );
      // Since attachments is a virtual field, we don't need to update it in the post document
      // The virtual field will automatically populate the attachments when queried
    }

    const updated = await this.postModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("attachments").lean();

    if (!updated) {
      throw new NotFoundException(`Post with id ${id} not found after update`);
    }

    return { ...updated };
  }

  async remove(id: string, user: User): Promise<Post> {

    const post = await this.postModel.findOneAndDelete({
      _id: toObjectId(id),
      createdBy: toObjectId(user.userId)
    }).lean();
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    await this.acttachmentService.deleteAll({
      ownerId: post._id,
      ownerType: 'Post',
    })

    return post;
  }
} 