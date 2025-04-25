import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User, UserRole, UserStatus } from '../user/user.model';
import { RefreshTokenService } from './refresh-token.service';
import { getInfoData } from '../common/utils';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
    private configService: ConfigService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByEmail(email);
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active. Please wait for approval.');
    }

    // Create access token
    const accessToken = this.createAccessToken(user);

    // Create refresh token
    const refreshToken = await this.createRefreshToken(user._id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
      expires_in: 900, // 15 minutes in seconds
      user: getInfoData(['_id', 'name', 'email', 'role'], user)
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create({
      ...registerDto,
      role: UserRole.MEMBER,
      status: UserStatus.PENDING,
    });

    return {
      message: 'Registration successful. Please wait for account approval.',
      user: getInfoData(['_id', 'name', 'email'], user, "user_id"),
    };
  }

  async refreshToken(token: string) {
    // Validate the refresh token
    const refreshToken = await this.refreshTokenService.validateRefreshToken(token);

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
    const accessToken = this.createAccessToken(user);
    const newRefreshToken = await this.createRefreshToken(user._id);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken.token,
      expires_in: 900, // 15 minutes in seconds
      user: getInfoData(['_id', 'name', 'email', 'role'], user)
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
    } catch (error) {
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
      console.log('Existing user logged in via Google:', existingUser.email);
      return existingUser;
    } catch (error) {
      // User not found - this is a registration
      console.log('New user registering via Google:', email);
      const newUser = await this.userService.create({
        name: profile.displayName,
        email: email,
        phone: "",
        address: "",
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
      user: getInfoData(['_id', 'name', 'email', 'role'], user)
    };
  }

  private createAccessToken(user: any): string {
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  private async createRefreshToken(userId: string) {
    // Refresh token valid for 7 days (in seconds)
    const refreshTokenExpiry = 7 * 24 * 60 * 60;

    // Revoke any existing refresh tokens
    await this.refreshTokenService.revokeAllUserTokens(userId);

    // Create a new refresh token
    return this.refreshTokenService.createRefreshToken(userId, refreshTokenExpiry);
  }
}
