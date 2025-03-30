import { Injectable, ConflictException } from '@nestjs/common';
import { Member } from './member.model';
import { MemberRepository } from './member.repository.js';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';

@Injectable()
export class MemberService {
  constructor(private readonly memberRepository: MemberRepository) {}

  async findAll(size?: number, page?: number) {
    return this.memberRepository.findAll(size, page);
  }

  async findOne(id: string) {
    return this.memberRepository.findOne(id);
  }

  async create(createMemberDto: CreateMemberDto) {
    try {
      // Check if member with email already exists
      const existingMember = await this.memberRepository.findByEmail(
        createMemberDto.email,
      );
      if (existingMember) {
        throw new ConflictException('Email already exists');
      }

      const member = new Member();
      Object.assign(member, createMemberDto);

      return this.memberRepository.create(member);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async update(id: string, updateMemberDto: UpdateMemberDto) {
    const member = new Member();
    Object.assign(member, updateMemberDto);
    return this.memberRepository.update(id, member);
  }

  async delete(id: string) {
    return this.memberRepository.delete(id);
  }
}
