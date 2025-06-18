import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { MailService } from 'src/notification/mail.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken, RefreshTokenSchema } from './models/refresh-token.model';
import { RefreshTokenService } from './refresh-token.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule,
    UploadModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          // Tạo tên file ngẫu nhiên để tránh trùng lặp
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '7d' }, // Shorter expiration for access tokens
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    MicrosoftStrategy,
    GoogleStrategy,
    RefreshTokenService,
    MailService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
