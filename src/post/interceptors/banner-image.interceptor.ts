import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class BannerImageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const file = request.file;

    if (!file) {
      throw new BadRequestException('Banner image is required');
    }

    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      throw new BadRequestException('Only image files are allowed for banner!');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Banner image size must be less than 5MB');
    }

    return next.handle();
  }
}
