import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('AppController (e2e)', () => {
  let app: INestApplication
  let token
  let userId
  let connection: Connection
  let moduleFixture: TestingModule

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api')
    await app.init();
    connection = await moduleFixture.get(getConnectionToken());
    await connection.dropDatabase()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
    await app.close();
    await moduleFixture.close()
  })

  describe('Auth and User', () => {
    it('/auth/register (POST)', async () => {
       const test = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: "Zoe",
          email: "zoe@gmail.com",
          password: "12345678"
        }).expect(201)
        expect(test).toBeDefined()

        token = test.body.token
    })

    // it('/auth/register (POST) duplicate', () => {
    //   return request(app.getHttpServer())
    //     .post('/api/auth/register')
    //     .send({
    //       username: "Zoe",
    //       email: "zoe@gmail.com",
    //       password: "12345678"
    //     })
    //     .expect(409)
    // })

    // it('/auth/login (POST)', () => {
    //   return request(app.getHttpServer())
    //     .post('/api/auth/login')
    //     .send({
    //       email: "zoe@gmail.com",
    //       password: "12345678"
    //     })
    //     .expect(201)
    // })

    // it('/auth/login (POST) Wrong Password', () => {
    //   return request(app.getHttpServer())
    //     .post('/api/auth/login')
    //     .send({
    //       email: "zoe@gmail.com",
    //       password: "123"
    //     })
    //     .expect(401)
    // })

    // it('/user/profile (GET)', async () => {
    //   const res = await request(app.getHttpServer())
    //     .get('/api/user/profile')
    //     .set('Authorization', `Bearer ${token}`)
    //   expect(res.statusCode).toBe(200)
    //   userId = res.body.userId
    // })
  })

  // describe("Roles", () => {
  //   it('/user (GET) Protected Route: No Admin Role', () => {
  //     return request(app.getHttpServer())
  //       .get('/api/user')
  //       .set('Authorization', `Bearer ${token}`)
  //       .expect(403)
  //   })

  //   it('/user/testing (PATCH) Change to Admin', () => {
  //     return request(app.getHttpServer())
  //       .patch(`/api/user/testing/${userId}`)
  //       .send({
  //         role: "admin"
  //       })
  //       .expect(200)
  //   })

  //   it('/auth/login (POST)', async () => {
  //     const res = await request(app.getHttpServer())
  //       .post('/api/auth/login')
  //       .send({
  //         email: "zoe@gmail.com",
  //         password: "12345678"
  //       })
  //     expect(res.statusCode).toBe(201)
  //     token = res.body.access_token
  //   })

  //   it('/user (GET) Protected Route: Admin Role', async () => {
  //     return request(app.getHttpServer())
  //       .get('/api/user')
  //       .set('Authorization', `Bearer ${token}`)
  //       .expect(200)
  //   })
  // })

  // // MC TODO: Is this even allowed?
  // describe('Delete user', () => {
  //   it('/user/:id (DELETE)', async () => {
  //     return request(app.getHttpServer())
  //       .delete(`/api/user/${userId}`)
  //       .expect(200)
  //   })
  // })

});

