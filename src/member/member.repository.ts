import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from './member.model';

@Injectable()
export class MemberRepository {
  constructor(@InjectModel(Member.name) private memberModel: Model<Member>) {}

  async findAll(size: number = 10, page: number = 1) {
    const skip = (page - 1) * size;
    return this.memberModel.find().skip(skip).limit(size).exec();
  }

  async findOne(id: string) {
    return this.memberModel.findById(id).exec();
  }

  async findByEmail(email: string) {
    return this.memberModel.findOne({ email }).exec();
  }

  async create(member: Member) {
    const newMember = new this.memberModel(member);
    return newMember.save();
  }

  async update(id: string, member: Member) {
    return this.memberModel.findByIdAndUpdate(id, member, { new: true }).exec();
  }

  async delete(id: string) {
    return this.memberModel.findByIdAndDelete(id).exec();
  }
}
