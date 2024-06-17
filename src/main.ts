import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ENVIRONMENT } from './common/constant/environmentVariables/environment.var';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.use(helmet());

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.use(
    compression({
      global: true,
      filter: () => {
        return true;
      },
      threshold: 0,
    }),
  );

  const PORT = ENVIRONMENT.CONNECTION.PORT || 3000;

  await app.listen(PORT);
}
bootstrap();
