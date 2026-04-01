import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ ACTIVER CORS POUR ANGULAR
  app.enableCors({
    origin: 'http://localhost:4200', // Angular
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Mediflow API')
    .setDescription('API for Mediflow backend. Import in Postman via Import → Link → {{baseUrl}}/api-json')
    .setVersion('1.0')
    .addTag('auth', 'Sign up, sign in, password reset')
    .addTag('users', 'User CRUD and avatar')
    .addTag('roles', 'Role CRUD')
    .addTag('upload', 'File upload')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);

  app.use('/uploads', express.static('uploads'));
}
bootstrap();