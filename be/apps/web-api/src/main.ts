import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
  });

  console.log('PORT: ' + process.env.PORT);

  console.log('VIDEO_DIRECTORY: ' + process.env.VIDEO_DIRECTORY);
  const server = await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
