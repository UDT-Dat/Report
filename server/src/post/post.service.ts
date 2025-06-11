import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AttachmentService } from 'src/attachment/attachment.service';
import { toObjectId } from 'src/common/utils';
import convertParam from 'src/common/utils/convert-params';
import { User, UserRole } from '../user/user.model';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostDocument, PostStatus } from './post.model';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly attachmentService: AttachmentService,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    user: User,
    bannerImage: Express.Multer.File,
    attachments?: Express.Multer.File[],
  ): Promise<Post> {
    const post = await this.postModel.create({
      ...createPostDto,
      createdBy: toObjectId(user.userId),
      bannerImage: bannerImage.path,
    });
    if (attachments && attachments.length > 0) {
      post.attachments = await this.attachmentService.uploadAttachment(
        attachments,
        post._id,
        'Post',
        user.userId,
      );
    }
    return post;
  }

  async findAll(
    query: object & { page: string; limit: string },
    user?: User,
  ): Promise<{
    posts: Post[];
    pagination: { total: number; page: number; limit: number };
  }> {
    // eslint-disable-next-line prefer-const
    let { result: filter, errors, pagination } = convertParam(query);
    if (errors.length > 0) {
      throw new BadRequestException(errors.join('.'));
    }
    if ('createdBy' in filter) {
      filter.createdBy = toObjectId(filter.createdBy as string);
    }

    // FIX: Only BOD users can see pending posts, others only see approved posts
    // if (user?.role !== UserRole.BOD) {
    //   filter = {
    //     ...filter,
    //     status: PostStatus.Approved,
    //   };
    // }

    console.log(
      'Filter',
      user?.role === UserRole.BOD
        ? filter
        : { ...filter, status: PostStatus.Approved },
    );
    console.log('Pagination', pagination);

    const [result] = await this.postModel
      .aggregate([
        {
          $match: {
            ...(user?.role === UserRole.BOD
              ? filter
              : { ...filter, status: PostStatus.Approved }),
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
            posts: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'createdBy',
                  foreignField: '_id',
                  as: 'createdBy',
                },
              },
              {
                $lookup: {
                  from: 'likes',
                  localField: '_id',
                  foreignField: 'post',
                  as: 'likes',
                },
              },
              {
                $lookup: {
                  from: 'comments',
                  localField: '_id',
                  foreignField: 'post',
                  as: 'comments',
                },
              },
              {
                $unwind: {
                  path: '$createdBy',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  content: 1,
                  createdBy: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    avatar: 1,
                  },
                  status: 1,
                  likes: {
                    $size: '$likes',
                  },
                  comments: {
                    $size: '$comments',
                  },
                  createdAt: 1,
                  updatedAt: 1,
                  bannerImage: 1,
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
      ])
      .sort({
        createdAt: -1,
      });

    return {
      posts: result.posts,
      pagination: result.metadata[0] ?? {
        total: 0,
        page: pagination.page,
        limit: pagination.limit,
      },
    };
  }

  async findOne(id: string): Promise<Post> {
    const [post] = await this.postModel.aggregate([
      {
        $match: {
          _id: toObjectId(id),
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
        $lookup: {
          from: 'attachments',
          localField: '_id',
          foreignField: 'ownerId',
          as: 'attachments',
        },
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'post',
          as: 'likes',
        },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'post',
          as: 'comments',
        },
      },

      {
        $unwind: '$createdBy',
      },
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          bannerImage: 1,
          createdBy: {
            _id: 1,
            name: 1,
            email: 1,
            avatar: 1,
          },
          attachments: 1,
          createdAt: 1,
          updatedAt: 1,
          status: 1,
          likes: {
            $size: '$likes',
          },
          comments: {
            $size: '$comments',
          },
        },
      },
    ]);

    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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

    const updateData = {
      ...updatePostDto,
      ...(bannerImage ? { bannerImage: bannerImage.path } : {}),
    };
    // Handle removal of attachments
    if (
      updatePostDto.removeAttachments &&
      updatePostDto.removeAttachments.length > 0
    ) {
      for (const attachmentId of updatePostDto.removeAttachments) {
        await this.attachmentService.findAndDeleteAttachmentById(attachmentId);
      }
    }
    // Handle new attachments
    if (attachments && attachments.length > 0) {
      await this.attachmentService.uploadAttachment(
        attachments,
        post._id,
        'Post',
        user.userId,
      );
      // Since attachments is a virtual field, we don't need to update it in the post document
      // The virtual field will automatically populate the attachments when queried
    }

    const updated = await this.postModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('attachments')
      .lean();

    if (!updated) {
      throw new NotFoundException(`Post with id ${id} not found after update`);
    }

    return { ...updated };
  }

  async remove(id: string, user: User): Promise<Post> {
    const filter: Record<string, any> = {
      _id: toObjectId(id),
    };

    if (user.role !== UserRole.BOD) {
      filter.createdBy = toObjectId(user.userId);
    }
    const post = await this.postModel.findOneAndDelete(filter).lean();
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    await this.attachmentService.deleteAll({
      ownerId: post._id,
      ownerType: 'Post',
    });

    return post;
  }

  async updateStatus(
    id: string,
    status: PostStatus,
    user: User,
  ): Promise<Post> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    if (user.role !== UserRole.BOD) {
      throw new BadRequestException('Only BOD can update post status');
    }
    post.status = status;
    return post.save();
  }
}
