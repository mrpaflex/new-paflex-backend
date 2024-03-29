import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { ENVIRONMENT } from './common/constant/environmentVariables/environment.var';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser());
  app.use(
    session({
      secret: ENVIRONMENT.CONN_PORT.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const port = ENVIRONMENT.CONN_PORT.PORT;
  await app.listen(port, () => {
    console.log(`now running on port ${port}`);
  });
}
bootstrap();
