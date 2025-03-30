import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument, PostStatus } from './models/post.model';
import { Media, MediaDocument, MediaType } from './models/media.model';
import { User } from '../auth/user.model';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
  ) {}

  // Post Management
  async createPost(
    title: string,
    content: string,
    user: any,
    attachments: string[] = [],
  ) {
    try {
      const post = new this.postModel({
        title,
        content,
        author: user.userId,
        attachments,
        status: PostStatus.PENDING,
      });
      const savedPost = await post.save();
      return savedPost.populate('author');
    } catch (error) {
      console.error('Error creating post:', error);
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  async getPosts(status?: PostStatus) {
    try {
      const query = status ? { status } : {};
      return await this.postModel.find(query).populate('author').exec();
    } catch (error) {
      console.error('Error getting posts:', error);
      throw new InternalServerErrorException('Failed to get posts');
    }
  }

  async getPostById(id: string) {
    try {
      const post = await this.postModel.findById(id).populate('author').exec();
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      return post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error getting post by id:', error);
      throw new InternalServerErrorException('Failed to get post');
    }
  }

  async updatePost(
    id: string,
    user: any,
    updateData: {
      title?: string;
      content?: string;
      attachments?: string[];
    },
  ) {
    try {
      console.log('Updating post with ID:', id);
      console.log('User data:', user);

      const post = await this.postModel.findById(id).populate('author');
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      console.log('Found post:', post);
      console.log('Post author:', post.author);
      console.log('Current user ID:', user.userId);

      // Convert both IDs to strings for comparison
      const authorId =
        post.author instanceof Types.ObjectId
          ? post.author.toString()
          : (post.author as any)._id.toString();
      const userId = user.userId.toString();

      console.log('Comparing IDs:', { authorId, userId });

      if (authorId !== userId) {
        console.log('Authorization failed: IDs do not match');
        throw new UnauthorizedException('Not authorized to update this post');
      }

      // Update using findOneAndUpdate for atomic operation
      const updatedPost = await this.postModel
        .findOneAndUpdate({ _id: id }, { $set: updateData }, { new: true })
        .populate('author')
        .exec();

      if (!updatedPost) {
        throw new NotFoundException('Post not found after update');
      }

      console.log('Post updated successfully:', updatedPost);
      return updatedPost;
    } catch (error) {
      console.error('Error in updatePost:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update post');
    }
  }

  async deletePost(id: string, user: any) {
    try {
      console.log('Starting delete post process...');
      console.log('Post ID:', id);
      console.log('User data:', JSON.stringify(user));

      // First find the post without population to get raw author ID
      const post = await this.postModel.findById(id);
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Get raw author ID as string
      const authorId = post.author.toString();
      const userId = user.userId.toString();

      console.log('Raw author ID:', authorId);
      console.log('User ID:', userId);

      // Compare raw IDs
      if (authorId !== userId) {
        console.log('Authorization failed - IDs do not match');
        console.log('Author ID (post):', authorId);
        console.log('User ID (request):', userId);
        throw new UnauthorizedException('Not authorized to delete this post');
      }

      console.log('Authorization successful - deleting post...');

      // Delete the post
      const deletedPost = await this.postModel.findByIdAndDelete(id).exec();

      if (!deletedPost) {
        throw new NotFoundException('Post not found during deletion');
      }

      console.log('Post deleted successfully');
      return { message: 'Post deleted successfully' };
    } catch (error) {
      console.error('Error in deletePost:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete post');
    }
  }

  async approvePost(id: string, user: any) {
    try {
      const post = await this.postModel.findById(id);
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      post.status = PostStatus.APPROVED;
      post.approvedBy = user.userId;
      post.approvedAt = new Date();
      return await post.save();
    } catch (error) {
      console.error('Error approving post:', error);
      throw new InternalServerErrorException('Failed to approve post');
    }
  }

  // Media Management
  async uploadMedia(
    file: Express.Multer.File,
    type: MediaType,
    user: User,
    description?: string,
  ) {
    const media = new this.mediaModel({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      type,
      uploadedBy: user.userId,
      description,
    });
    return media.save();
  }

  async getMediaFiles(type?: MediaType) {
    const query = type ? { type } : {};
    return this.mediaModel.find(query).populate('uploadedBy').exec();
  }

  async getMediaById(id: string) {
    const media = await this.mediaModel
      .findById(id)
      .populate('uploadedBy')
      .exec();
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return media;
  }

  async deleteMedia(id: string, user: User) {
    const media = await this.mediaModel.findById(id);
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (media.uploadedBy.toString() !== user.userId) {
      throw new UnauthorizedException('Not authorized to delete this media');
    }

    return this.mediaModel.findByIdAndDelete(id);
  }
}
