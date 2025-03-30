import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { EventModule } from './event/event.module';
import { MemberModule } from './member/member.module';
import { AuthModule } from './auth/auth.module';
import { LibraryModule } from './library/library.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with specific options
  app.enableCors({
    origin: true, // Cho phép tất cả origins trong môi trường development
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Add validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Club Management API')
    .setDescription('The Club Management API description')
    .setVersion('1.0')
    .addTag('Events')
    .addTag('Members')
    .addTag('Auth')
    .addTag('Library')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [EventModule, MemberModule, AuthModule, LibraryModule],
  });
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
