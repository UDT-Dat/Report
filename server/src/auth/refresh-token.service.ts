import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './models/refresh-token.model';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async createRefreshToken(
    userId: string,
    expiresIn: number,
  ): Promise<RefreshToken> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + expiresIn * 1000);

    const refreshToken = new this.refreshTokenModel({
      id: uuidv4(),
      token,
      userId,
      expiresAt,
      isRevoked: false,
    });

    return refreshToken.save();
  }

  async findTokenByUserId(userId: string): Promise<RefreshToken | null> {
    return this.refreshTokenModel
      .findOne({
        userId,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      })
      .exec();
  }

  async findTokenByValue(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenModel
      .findOne({
        token,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      })
      .exec();
  }

  async revokeToken(id: string): Promise<void> {
    await this.refreshTokenModel.updateOne({ id }, { isRevoked: true }).exec();
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenModel
      .updateMany({ userId }, { isRevoked: true })
      .exec();
  }

  async validateRefreshToken(token: string): Promise<RefreshToken> {
    const refreshToken = await this.findTokenByValue(token);

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    if (refreshToken.isRevoked) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    return refreshToken;
  }
}
