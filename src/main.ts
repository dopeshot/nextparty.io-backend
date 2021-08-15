import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')

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

  await app.listen(+process.env.PORT || 3000);
}
bootstrap();
