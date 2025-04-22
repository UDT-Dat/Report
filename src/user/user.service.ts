import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument, UserRole, UserStatus } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto, createdBy?: string): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // If user is created by admin, set status to ACTIVE
    let status = UserStatus.PENDING;
    if (createdBy && createdBy === UserRole.ADMIN) {
      status = UserStatus.ACTIVE;
    }

    const user = new this.userModel({
      id: uuidv4(),
      ...createUserDto,
      password: hashedPassword,
      status: createUserDto.status || status,
    });

    return (await user.save()).toObject();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findOne({ id }).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user.toObject();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findOne({ id }).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user.toObject();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findOne({ id })
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({ email: updateUserDto.email });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    return user.updateOne(updateUserDto, { new: true }).exec();
  }

  async remove(id: string): Promise<User> {
    const user = await this.userModel.findOneAndDelete({ id }).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async approveUser(id: string): Promise<User> {
    const user = await this.userModel.findOne({ id }).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    user.status = UserStatus.ACTIVE;
    return user.save();
  }

  async assignMentor(id: string): Promise<User> {
    const user = await this.userModel.findOne({ id }).exec();
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