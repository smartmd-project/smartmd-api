import 'dotenv/config'; // Tải biến môi trường từ file .env
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //cấu hình CORS để cho phép truy cập từ client
  app.enableCors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //tự loại bỏ field ko khai báo trong DTO
      forbidNonWhitelisted: true, //ném lỗi nếu có field không được phép
      transform: true, //tự động chuyển đổi payload thành các class DTO
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('smartMD API')
    .setDescription(
      'API documentation for smartMD Markdown editor backend: authentication, users, notes, Markdown rendering, file import, and grammar checking.',
    )
    .setVersion('1.0')
    .addCookieAuth('access_token', { type: 'apiKey' }, 'access_token')
    .addCookieAuth('refresh_token', { type: 'apiKey' }, 'refresh_token')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
