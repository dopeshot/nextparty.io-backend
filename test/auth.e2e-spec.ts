import { MailerModule } from '@nestjs-modules/mailer';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthModule } from '../src/auth/auth.module';
import { UserDocument } from '../src/user/entities/user.entity';
import { UserModule } from '../src/user/user.module';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from './helpers/MongoMemoryHelpers';
import { getTestAdmin, getTestAdminJWT, getTestUser, getTestUserJWT } from './__mocks__/user-mock-data';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let userModel: Model<UserDocument>

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), UserModule, AuthModule, MailerModule,
        ConfigModule.forRoot({
          envFilePath: ['.env', '.development.env']
        })],
    }).compile();

    connection = await module.get(getConnectionToken());
    userModel = connection.model('User')
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  // Insert test data
  beforeEach(async () => {
  });

  // Empty the collection from all possible impurities
  afterEach(async () => {
    await userModel.deleteMany()
  });

  afterAll(async () => {
    await connection.close();
    closeInMongodConnection();
    await app.close()
  });

  describe('Auth and User', () => {
    it('/auth/register (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'fictional user',
          email: 'fictional@gmail.com',
          password: '12345678',
        })
        .expect(HttpStatus.CREATED); 
    });

    it('/auth/register (POST) duplicate mail', async () => {
      await userModel.create(await getTestUser())
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'a mock user',
          email: 'mock@mock.mock',
          password: 'mensa essen',
        })
        .expect(409);
      return res;
    });

    it('/auth/register (POST) duplicate mail', async () => {
      await userModel.create(await getTestUser())
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'mock',
          email: 'notMock@mock.mock',
          password: 'mensa essen',
        })
        .expect(409);
      return res;
    });

    it('/auth/login (POST)', async () => {
      await userModel.create(await getTestUser())
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'mock@mock.mock',
          password: 'mock password',
        })
        .expect(HttpStatus.CREATED);
    });

    it('/auth/login (POST) Wrong Password', async () => {
      await userModel.create(await getTestUser())
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'mock@mock.mock',
          password: 'my grandmas birthday',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/user/profile (GET)', async () => {
      await userModel.create(await getTestUser())
      const res = request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${await getTestUserJWT()}`)
        .expect(HttpStatus.OK);
      return res;
    });
  });

  describe('Roles', () => {
    it('/user (GET) Protected Route: No Admin Role', async () => {
      await userModel.create(await getTestUser())
      const res = request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${await getTestUserJWT()}`)
        .expect(HttpStatus.FORBIDDEN);
      return res;
    });

    it('/user (GET) using Admin', async () => {
      await userModel.insertMany([await getTestUser(), await getTestAdmin()])
      const res = request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${await getTestAdminJWT()}`)
        .expect(HttpStatus.OK);
      
      expect((await res).body.length).toBe(2)
      return res;
    });
  });
});