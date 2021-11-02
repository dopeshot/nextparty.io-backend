import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api')
  
  app.setBaseViewsDir(join(__dirname, '..', 'views'))
  app.setViewEngine('ejs')

  const config = new DocumentBuilder()
    .setTitle('Truth or Dare: Community Backend')
    .setDescription('Back! End! Back! End! Back! End! End!')
    .setVersion('0.1')
    .addTag('auth', 'All related to authorization')
    .addTag('category', 'Categories are only for admins. Categories contains Sets')
    .addTag('report', 'Report User, Task or Set')
    .addTag('search')
    .addTag('set', 'Set is a collection of task')
    .addTag('system')
    .addTag('task', 'Task is either a Truth or Dare')
    .addTag('user', 'User related content')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, document)
  app.enableCors()
  await app.listen(+process.env.PORT || 3000, () => Logger.log(`Nest listing on ${process.env.HOST}`, 'Bootstrap'))
}
bootstrap();
