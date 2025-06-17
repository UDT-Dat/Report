import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserStatus } from 'src/user/user.model';
import { UserService } from 'src/user/user.service';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'your-secret-key',
    });
  }

  async validate(payload: any) {
    // Return user information from JWT payload
    // check user is status is active or exist
    const user = await this.userService.findById(payload.sub as string);
    if (
      !user ||
      ![UserStatus.ACTIVE, UserStatus.PENDING].includes(user.status)
    ) {
      throw new UnauthorizedException('User is not active or does not exist');
    }
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
