import { Response } from 'express';
import { UserService } from 'src/user/user.service';

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/user/user.model';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    // Set refresh token in HttpOnly cookie
    const { refresh_token, ...responseData } = result;
    this.setRefreshTokenCookie(res, refresh_token);
    this.setAccessTokenCookie(res, result.access_token);

    return responseData;
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);

    return result;
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresh access token using refresh token from cookie',
  })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Get refresh token from cookie
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const result = await this.authService.refreshToken(refreshToken);

      // Set new refresh token in HttpOnly cookie
      this.setRefreshTokenCookie(res, result.refresh_token);
      this.setAccessTokenCookie(res, result.access_token);
      // Remove refresh token from response
      const { refresh_token, ...responseData } = result;

      return responseData;
    } catch (error) {
      this.clearAccessTokenCookie(res);
      this.clearRefreshTokenCookie(res);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout and invalidate refresh tokens' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    // Clear refresh token cookie
    res.clearCookie('refresh_token');
    res.clearCookie('access_token');
    return this.authService.logout(req.user.userId);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Register and login with Google' })
  googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Google OAuth callback URL - handles both new and returning users',
  })
  async googleAuthCallback(@Request() req, @Res() res: Response) {
    const tokenData = await this.authService.generateToken(req.user as User);

    // Set refresh token in HttpOnly cookie
    this.setRefreshTokenCookie(res, tokenData.refresh_token);
    this.setAccessTokenCookie(res, tokenData.access_token);
    // Redirect to frontend callback page with only access token
    return res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
  }

  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  @ApiOperation({ summary: 'Login with Microsoft' })
  microsoftAuth() {
    // Initiates Microsoft OAuth flow
  }

  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  @ApiOperation({ summary: 'Microsoft OAuth callback URL' })
  async microsoftAuthCallback(@Request() req, @Res() res: Response) {
    const tokenData = await this.authService.generateToken(req.user);

    // Set refresh token in HttpOnly cookie
    this.setRefreshTokenCookie(res, tokenData.refresh_token);

    // Redirect to frontend callback page with only access token
    return res.redirect(`/auth/callback.html?token=${tokenData.access_token}`);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getProfile(@Request() req) {
    return {
      user: await this.userService.findById(req.user.userId as string),
    };
  }

  @Post('verify-student')
  @UseInterceptors(
    FileInterceptor('studentCard', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        // Kiểm tra loại file có phải là hình ảnh không
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException(
              'Only image files are allowed (jpg, jpeg, png, gif)',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify student status' })
  @ApiResponse({ status: 200, description: 'Student verified successfully' })
  async verifyStudent(
    @Request() req,
    @Body()
    body: {
      userId: string;
      studentCode: string;
      course: string;
    },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const retrieveFilePath = file.path.replace(/\\/g, '/');
    const isVerified = await this.authService.verifyStudent({
      userId: body.userId,
      studentCode: body.studentCode,
      course: body.course,
      studentCard: '/' + retrieveFilePath,
    });
    if (!isVerified) {
      throw new UnauthorizedException('Student verification failed');
    }
    return {};
  }

  private setRefreshTokenCookie(res: Response, token: string) {
    // Set refresh token as HttpOnly cookie
    res.cookie('refresh_token', token, {
      httpOnly: true, // Prevents client-side JS from reading the cookie
      secure: this.configService.get('NODE_ENV') === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/', // Cookie is valid for all routes
    });
  }

  private setAccessTokenCookie(res: Response, token: string) {
    res.cookie('access_token', token, {
      httpOnly: true, // Prevents client-side JS from reading the cookie
      secure: this.configService.get('NODE_ENV') === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
      path: '/', // Cookie is valid for all routes
    });
  }

  private clearAccessTokenCookie(res: Response) {
    res.clearCookie('access_token');
  }

  private clearRefreshTokenCookie(res: Response) {
    res.clearCookie('refresh_token');
  }
}
