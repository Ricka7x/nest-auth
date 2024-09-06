import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.enableCors('');
  // app.useGlobalPipes(new ValidationPipe());
  // app.use(compression());
  await app.listen(3000);
}
bootstrap();
