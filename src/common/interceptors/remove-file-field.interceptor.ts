// src/common/interceptors/remove-file-field.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RemoveFileFieldInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Xóa trường 'file' khỏi body nếu nó tồn tại
    if (request.body && request.body.file !== undefined) {
      delete request.body.file;
    }

    return next.handle();
  }
}
