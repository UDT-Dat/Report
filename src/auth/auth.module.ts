import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { UserModule } from '../user/user.module';
import { RefreshToken, RefreshTokenSchema } from './models/refresh-token.model';
import { RefreshTokenService } from './refresh-token.service';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema }
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
  providers: [AuthService, JwtStrategy, MicrosoftStrategy, GoogleStrategy, RefreshTokenService],
  exports: [AuthService],
})
export class AuthModule { }
