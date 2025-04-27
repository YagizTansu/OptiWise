// Import polyfill before any other imports
import './polyfill';

import { config } from 'dotenv';
config(); // Load .env file contents into process.env

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for frontend integration
  
  // Add global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  // Add API prefix
  app.setGlobalPrefix('api');
  
  await app.listen(process.env.PORT || 3001); // <<< BURASI ÖNEMLİ
}
bootstrap();
