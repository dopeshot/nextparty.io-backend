import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { ObjectId } from 'mongoose';

describe('SetController (e2e)', () => {
  let app: INestApplication
  let token: string
  let otherToken: string
  let userId: ObjectId
  let otherUserId: string
  let setId1: ObjectId
  let setId2: ObjectId

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api')
    await app.init();
  });

  /*---------------------\ 
  |      User Setup      |
  \---------------------*/

  describe('Login', () => {
    it('/auth/register (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: "Hahaxd",
          email: "Hahaxd@gmail.com",
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

    it('/auth/register (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: "Hahaxd2",
          email: "Hahaxd2@gmail.com",
          password: "12345678"
        })
        .expect(201)

      otherToken = res.body.access_token
      return res
    })

    it('/user/profile (GET)', async () => {
      const res = request(app.getHttpServer())
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200)

      otherUserId = (await res).body.userId
      return res
    })
  })

  /*----------------------\ 
  |      Create Data      |
  \----------------------*/

  describe('Create data', () => {
    it('/set (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/set')
        .set('Authorization', `Bearer ${token}`)
        .send({
          language: "de",
          name: "super cool set"
        })
        .expect(201)
      expect([res.body._id, res.body.daresCount,res.body.truthCount,res.body.language,res.body.name,res.body.createdBy._id,res.body.createdBy.username]).toBeDefined()
      setId1 = (res.body._id)
      return res
    })

    it('/set (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/set')
        .set('Authorization', `Bearer ${token}`)
        .send({
          language: "de",
          name: "super cool set"
        })
        .expect(201)
      setId2 = (res.body._id)
      expect(setId2==setId1).toBeFalsy()
      return res
    })
  })

  /*---------------------\ 
  |         Sets         |
  \---------------------*/

  describe('Sets', () => {
    it('/set/:id (DELETE) type=soft own User', () => {
      const res = request(app.getHttpServer())
        .delete(`/api/set/${setId1}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)
      return res
    })
    //Test cancel because error gets thrown in console
    it('/set/:id (DELETE) type=soft other User', () => {
      const res = request(app.getHttpServer())
        .delete(`/api/set/${setId2}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404)
      return res
    })
    

    //Test cancel because error gets thrown in console
    it('/set/:id (DELETE) type=hard user', () => {
      const res = request(app.getHttpServer())
        .delete(`/api/set/${setId1}?type=hard`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
      return res
    })
  

    it('/user/testing (PATCH) Change to Admin', async () => {
      const res = request(app.getHttpServer())
        .patch(`/api/user/testing/${userId}`)
        .send({
          role: "admin"
        })
        .expect(200)
      return res
    })

    it('/auth/login (POST)', async () => {
      const res = request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: "Hahaxd@gmail.com",
          password: "12345678"
        })
        .expect(201)

      token = (await res).body.access_token
      return res
    })

    it('/set/:id (DELETE) type=soft admin', () => {
      const res = request(app.getHttpServer())
        .delete(`/api/set/${setId2}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)
      return res
    })
  })

  /*----------------------\ 
  |        Cleanup        |
  \----------------------*/

  describe('Cleanup', () => {
    it('/set/:id (DELETE) type=hard', () => {
      const res = request(app.getHttpServer())
        .delete(`/api/set/${setId1}?type=hard`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)
      return res
    })

    it('/set/:id (DELETE) type=hard', () => {
      const res = request(app.getHttpServer())
        .delete(`/api/set/${setId2}?type=hard`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)
      return res
    })

    it('/user/:id (DELETE)', async () => {
      const res = request(app.getHttpServer())
        .delete(`/api/user/${userId}`)
        .expect(200)
      return res
    })

    it('/user/:id (DELETE)', async () => {
      const res = request(app.getHttpServer())
        .delete(`/api/user/${otherUserId}`)
        .expect(200)
      return res
    })
  })

  afterAll(async () => {
    await app.close();
  });
});

