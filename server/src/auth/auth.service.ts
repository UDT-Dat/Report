import * as bcrypt from 'bcrypt';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { MailService } from 'src/notification/mail.service';
import { UploadService } from 'src/upload/upload.service';
import { getInfoData } from '../common/utils';
import { User, UserRole, UserStatus } from '../user/user.model';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly mailService: MailService,
    private readonly uploadService: UploadService,
  ) {}

  async verifyStudent(data: {
    userId: string;
    studentCode: string;
    course: string;
    studentCard: Express.Multer.File;
  }) {
    const { userId, studentCode, course, studentCard } = data;
    const existingUser = await this.userService.checkStudentCode({
      studentCode,
      userId,
    });

    if (!existingUser) {
      throw new ConflictException('Mã sinh viên đã tồn tại trong hệ thống');
    }

    const uploaded = await this.uploadService.uploadToCloudinary(studentCard);

    // cập nhật thông tin sinh viên cho user
    const user = await this.userService.update(userId, {
      studentCode,
      course,
      studentCard: uploaded.url || uploaded.secure_url,
      status: UserStatus.VERIFYING,
    });

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Xác nhận thông tin sinh viên',
      html: `<p>Chào ${user.name},</p>
             <p>Chúng tôi đã nhận được yêu cầu xác nhận thông tin sinh viên của bạn.</p>
             <p>Thông tin của bạn sẽ được xem xét và xác nhận trong thời gian sớm nhất.</p>
             <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
             <p>Trân trọng,</p>
             <p>Đội ngũ hỗ trợ</p>`,
      text: `Chào ${user.name},\n\nChúng tôi đã nhận được yêu cầu xác nhận thông tin sinh viên của bạn.\nThông tin của bạn sẽ được xem xét và xác nhận trong thời gian sớm nhất.\nCảm ơn bạn đã sử dụng dịch vụ của chúng tôi.\nTrân trọng,\nĐội ngũ hỗ trợ`,
    });

    return user;
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Partial<User> | null> {
    try {
      const user = await this.userService.findByEmail(email);
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }

      return null;
    } catch {
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create access token
    const { access_token, refresh_token } = await this.generateToken(
      user as User,
    );

    // update last login time
    await this.userService.update(user._id as string, {
      lastLogin: new Date(),
    });

    return {
      access_token: access_token,
      refresh_token: refresh_token,
      expires_in: 900, // 15 minutes in seconds
      user: getInfoData(
        [
          '_id',
          'name',
          'email',
          'role',
          'avatar',
          'status',
          'studentCode',
          'course',
          'studentCard',
          'rejectReason',
        ],
        user,
      ),
    };
  }

  async register(registerDto: RegisterDto) {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Mật khẩu và xác nhận mật khẩu không khớp');
    }

    const user = await this.userService.create({
      ...registerDto,
      role: UserRole.MEMBER,
      status: UserStatus.PENDING,
    });

    return {
      message: 'Đăng ký thành công. Vui lòng chờ phê duyệt tài khoản.',
      user: getInfoData(['_id', 'name', 'email'], user, 'user_id'),
    };
  }

  async refreshToken(token: string) {
    // Validate the refresh token
    const refreshToken =
      await this.refreshTokenService.validateRefreshToken(token);

    // Get the user
    const user = await this.userService.findById(refreshToken.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Revoke the old refresh token
    await this.refreshTokenService.revokeToken(refreshToken.id);

    // Create new tokens
    const { access_token, refresh_token } = await this.generateToken(user);

    return {
      access_token: access_token,
      refresh_token: refresh_token,
      expires_in: 900, // 15 minutes in seconds
      user: getInfoData(['_id', 'name', 'email', 'role'], user),
    };
  }

  async logout(userId: string) {
    // Revoke all refresh tokens for the user
    await this.refreshTokenService.revokeAllUserTokens(userId);
    return { message: 'Logout successful' };
  }

  async validateMicrosoftUser(profile: any) {
    const email = profile.emails[0].value;

    try {
      // Try to find existing user
      const existingUser = await this.userService.findByEmail(email);
      return existingUser;
    } catch {
      // Create new user if not exists
      const newUser = await this.userService.create({
        name: profile.displayName,
        email: email,
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Random password
        role: UserRole.MEMBER,
        status: UserStatus.PENDING,
      });

      return newUser;
    }
  }

  async validateGoogleUser(profile: any) {
    const email = profile.emails[0].value;

    try {
      // Try to find existing user - if found, this is a login
      const existingUser = await this.userService.findByEmail(email);
      return existingUser;
    } catch {
      // User not found - this is a registration
      const newUser = await this.userService.create({
        name: profile.displayName,
        email: email,
        phone: '',
        address: '',
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Random password
        role: UserRole.MEMBER,
        status: UserStatus.PENDING,
      });

      return newUser;
    }
  }

  async generateToken(user: User) {
    // Create access token
    const accessToken = this.createAccessToken(user);

    // Create refresh token
    const refreshToken = await this.createRefreshToken(user._id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
      user: getInfoData(['_id', 'name', 'email', 'role'], user),
    };
  }

  private createAccessToken(user: any): string {
    const payload = {
      name: user.name,
      email: user.email,
      sub: user._id,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '60m',
    });
  }

  private async createRefreshToken(userId: string) {
    // Refresh token valid for 7 days (in seconds)
    const refreshTokenExpiry = 7 * 24 * 60 * 60;

    // Revoke any existing refresh tokens
    await this.refreshTokenService.revokeAllUserTokens(userId);

    // Create a new refresh token
    return this.refreshTokenService.createRefreshToken(
      userId,
      refreshTokenExpiry,
    );
  }
}
