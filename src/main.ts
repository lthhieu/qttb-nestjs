import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { TransformInterceptor } from 'src/configs/transform.interceptor';
import cookieParser from 'cookie-parser';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  //versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  //validation pipe
  app.useGlobalPipes(new ValidationPipe());

  //global response interceptor
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  //cors
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URI'),
    credentials: true
  });

  //global cookies
  app.use(cookieParser());

  //global jwt guard
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  //public folder
  app.useStaticAssets(join(__dirname, '..', 'public'))

  await app.listen(port ?? 8000);
}
bootstrap();
