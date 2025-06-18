import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { join } from 'path';
import { UploadModule } from 'src/upload/upload.module';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { StatsModule } from 'src/stats/stats.module';
import { AppModule } from './app.module';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { LibraryModule } from './library/library.module';
import { NotificationModule } from './notification/notification.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(morgan('dev'));
  // Enable CORS with specific options
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  // Cấu hình prefix cho tất cả các API routes
  app.setGlobalPrefix('api');

  // Phục vụ tệp tĩnh từ thư mục public
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Sử dụng cookie parser
  app.use(cookieParser());

  // Static file middleware for serving uploads
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Add validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Club Management API')
    .setDescription('The Club Management API description')
    .setVersion('1.0')
    .addTag('Users')
    .addTag('Auth')
    .addTag('Events')
    .addTag('Library')
    .addTag('Posts')
    .addTag('Notifications')
    .addTag('Stats')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [
      UserModule,
      AuthModule,
      EventModule,
      LibraryModule,
      PostModule,
      NotificationModule,
      UploadModule,
      StatsModule,
    ],
  });
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
