import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, Req, Request } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api')
    await app.init();
  });

  describe('Auth and User', () => {
    let token
    let userId

    it('/auth/register (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: "Zoe",
          email: "zoe@gmail.com",
          password: "12345678"
        })
        .expect(201)

      token = res.body.access_token
      return res
    })
    
    it('/auth/register (POST) duplicate', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: "Zoe",
          email: "zoe@gmail.com",
          password: "12345678"
        })
        .expect(409)
      return res
    })

    it('/auth/login (POST)', async () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: "zoe@gmail.com",
          password: "12345678"
        })
        .expect(201)
    })

    it('/auth/login (POST) Wrong Password', async () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: "zoe@gmail.com",
          password: "123"
        })
        .expect(401)
    })

    it('/user/profile (GET)', async () => {
      const res = request(app.getHttpServer())
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      userId = (await res).body.userId
      console.log(userId)
      return res
    })

    it('/user/:id (DELETE)', async () => {
      const res = request(app.getHttpServer())
        .delete(`/api/user/${userId}`)
        .expect(200)
      return res
    })
  })

  describe("Roles", () => {
    let token
    let userId

    it('/auth/register (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: "Zoe",
          email: "zoe@gmail.com",
          password: "12345678"
        })
        .expect(201)

      token = res.body.access_token
      return res
    })

    it('/user/profile (GET)', async () => {
      const res = request(app.getHttpServer())
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      userId = (await res).body.userId
      console.log(userId)
      return res
    })

    it('/user (GET) Protected Route: No Admin Role', async () => {
      const res = request(app.getHttpServer())
        .get('/api/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
      return res
    })
  })
  afterAll(async () => {
    await app.close();
  });
});

