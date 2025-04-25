import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { EventModule } from './event/event.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LibraryModule } from './library/library.module';
import { PostModule } from './post/post.module';
import { NotificationModule } from './notification/notification.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import helmet from 'helmet';
import * as morgan from 'morgan';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(helmet());
  app.use(morgan('dev'));
  // Enable CORS with specific options
  app.enableCors({
    origin: true, // Cho phép tất cả origins trong môi trường development
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
    ],
  });
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


