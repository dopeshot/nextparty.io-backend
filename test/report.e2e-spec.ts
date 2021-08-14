import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'

describe('ReportController (e2e)', () => {
  let app: INestApplication
  let token
  let userId

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api')
    await app.init();
  });

  describe('Login', () => {
    it('/auth/register (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: "Haha",
          email: "haha@gmail.com",
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
      return res
    })
  })

  describe('Reports', () => {
    it('/report (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/report')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contentType: "user",
          content: "6117d5a17045584ff8d3c689",
          reason: "offensive name"
        })
        .expect(201)
        return res
    })
  })

  describe('Cleanup', () => {
    it('/user/:id (DELETE)', async () => {
      const res = request(app.getHttpServer())
        .delete(`/api/user/${userId}`)
        .expect(200)
      return res
    })
  })

  afterAll(async () => {
    await app.close();
  });
});

