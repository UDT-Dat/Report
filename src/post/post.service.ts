import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Post, PostDocument } from './post.model';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User, UserRole } from '../user/user.model';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async create(createPostDto: CreatePostDto, user: User): Promise<Post> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can create posts');
    }

    const post = new this.postModel({
      id: uuidv4(),
      ...createPostDto,
      createdBy: user,
    });

    return post.save();
  }

  async findAll(): Promise<Post[]> {
    return this.postModel.find()
      .populate('createdBy')
      .exec();
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postModel.findOne({ id })
      .populate('createdBy')
      .exec();
    
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto, user: User): Promise<Post> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update posts');
    }

    const post = await this.postModel.findOne({ id }).exec();
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    return post.updateOne(updatePostDto, { new: true }).exec();
  }

  async remove(id: string, user: User): Promise<Post> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete posts');
    }

    const post = await this.postModel.findOneAndDelete({ id }).exec();
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    
    return post;
  }
} 