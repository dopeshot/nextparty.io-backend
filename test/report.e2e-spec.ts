import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { Connection, Mongoose, ObjectId } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('ReportController (e2e)', () => {
  let app: INestApplication
  let token: string
  let userId: ObjectId
  let reportId: ObjectId
  let connection: Connection

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api')
    await app.init();
    connection = await moduleFixture.get(getConnectionToken());
    await connection.dropDatabase()
  });

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
    await app.close();
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
      const res = await request(app.getHttpServer())
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
      reportId = res.body._id
      return res
    })

    it('/user/testing (PATCH) Change to Admin', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/user/testing/${userId}`)
        .send({
          role: "admin"
        })
        .expect(200)
      return res
    })

    it('/auth/login (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: "haha@gmail.com",
          password: "12345678"
        })
        .expect(201)

      token = (await res).body.access_token
      return res
    })

    it('/report (GET) Protected Route: Admin Role', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/report')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      return res
    })

    it('/report/:id (GET) Protected Route: Admin Role', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/report/${reportId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      return res
    })

    it('/report/:id (DELETE) type=soft', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/report/${reportId}?type=soft`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)
      return res
    })
  })

  describe('Cleanup', () => {
    it('/report/:id (DELETE) type=hard', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/report/${reportId}?type=hard`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)
      return res
    })

    it('/user/:id (DELETE)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/user/${userId}`)
        .expect(200)
      return res
    })
  })

});

