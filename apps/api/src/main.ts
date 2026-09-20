import { env } from './env';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

function logOAuthStatus() {
  const google = Boolean(env.googleClientId && env.googleClientSecret);
  const github = Boolean(env.githubClientId && env.githubClientSecret);
  console.log(`OAuth: google ${google ? 'enabled' : 'not configured'}, github ${github ? 'enabled' : 'not configured'}`);
}

logOAuthStatus();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: env.webOrigin,
    credentials: true,
  });

  await app.listen(env.port);
}

void bootstrap();
