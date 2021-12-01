import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, ObjectId, Schema } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TaskType } from '../src/set/enums/tasktype.enum';
import { ResponseSet, ResponseTask } from '../src/set/types/set.response';
import { Language } from '../src/shared/enums/language.enum';

describe('SetController (e2e)', () => {
  let app: INestApplication
  let token: string
  let otherToken: string
  let otherUserId: string
  let setId2: ObjectId
  const wrongId = "111adda131fc65699861a118"
  const exampleTask: ResponseTask = {
    _id: new Schema.Types.ObjectId(""),
    type: "truth",
    currentPlayerGender: "@ca",
    message: "Do you know this is a test?"
  }
  const exampleSet: ResponseSet = {
    _id: new Schema.Types.ObjectId(""),
    name: "Test set",
    createdBy: { _id: new Schema.Types.ObjectId(""), username: "TestUserName" },
    language: Language.DE,
    truthCount: 0,
    daresCount: 0,
    previewImage: "placeholder",
    bannerImage: "placeholder2"
  }
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

  /*---------------------\ 
  |      User Setup      |
  \---------------------*/

  describe('Login', () => {
    it('/auth/register (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: "TestUserName",
          email: "Hahaxd@gmail.com",
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

      exampleSet.createdBy._id = res.body.userId

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
      const res = await request(app.getHttpServer())
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200)

      otherUserId = res.body.userId
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
        .send({ language: exampleSet.language, name: exampleSet.name })
        .expect(201)
      expect(res.body.language).toEqual(exampleSet.language)
      expect(res.body.name).toEqual(exampleSet.name)
      // Expect to have the format of ResponseSet
      expect([res.body._id, res.body.daresCount, res.body.truthCount, res.body.language, res.body.name, res.body.createdBy._id, res.body.createdBy.username, res.body.previewImage, res.body.bannerImage]).toBeDefined()
      expect(res.body.status).toBeUndefined()
      // Update example set
      exampleSet._id = res.body._id
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
      expect(setId2 == exampleSet._id).toBeFalsy()
      return res
    })

    // Negative test
    it('/set (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/set')
        .set('Authorization', `Bearer ${token}`)
        .send({
          language: "wrong",
          name: "Doesn't matter"
        })
        .expect(400)
      return res
    })

  })

  /*---------------------\ 
  |         Sets         |
  \---------------------*/

  describe('Sets', () => {
    it('/set (GET)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/set')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      expect(res.body.length === 2).toBeTruthy()
      return res
    })

    it('/set/:id (GET)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/set/${exampleSet._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      expect(res.body).toEqual({ ...exampleSet, tasks: [] })
      return res
    })

    it('/set/:id (PATCH)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/set/${exampleSet._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          language: Language.EN,
          name: "English Set"
        })
        .expect(200)

      expect(res.body.language).toEqual(Language.EN)
      expect(res.body.name).toEqual("English Set")
      exampleSet.language = res.body.language
      exampleSet.name = res.body.name

      return res
    })

    // Negative test
    it('/set/:id (PATCH)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/set/${exampleSet._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          language: "adsa"
        })
        .expect(400)
      return res
    })

    // Negative test
    it('/set/:id (GET)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/set/${wrongId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
      return res
    })

    // Negative test
    it('/set/:id (PATCH)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/set/${wrongId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
      return res
    })

    /*----------------------\ 
    |         Tasks         |
    \----------------------*/

    it('/set/:id/task (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/set/${exampleSet._id}/task`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: exampleTask.type,
          currentPlayerGender: exampleTask.currentPlayerGender,
          message: exampleTask.message
        })
        .expect(201)
      exampleTask._id = res.body._id

      // Check if the count has been updated
      const res2 = await request(app.getHttpServer())
        .get(`/api/set/${exampleSet._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      expect(res2.body.truthCount === 1).toBeTruthy()
      expect(exampleTask).toEqual(res.body)
      return res
    })

    // Negative test
    it('/set/:id/task (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/set/${wrongId}/task`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
      return res
    })

    it('/set/:id/task/:taskid (PATCH)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/set/${exampleSet._id}/task/${exampleTask._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: TaskType.DARE,
          currentPlayerGender: exampleTask.currentPlayerGender,
          message: exampleTask.message
        })
        .expect(200)
      expect(res.body.daresCount === 1).toBeTruthy()
      expect(res.body.truthCount === 0).toBeTruthy()
      return res
    })

    // Negative test
    it('/set/:id/task/:taskid (PATCH)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/set/${exampleSet._id}/task/${wrongId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: "dare",
          currentPlayerGender: exampleTask.currentPlayerGender,
          message: exampleTask.message
        })
        .expect(404)
      return res
    })

    /*----------------------\ 
    |        Deletes        |
    \----------------------*/

    // Negativ test
    it('/set/:id/task/:taskid (DELETE) type=soft other User', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}/task/${exampleTask._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404)
      return res
    })

    // Negativ test
    it('/set/:id/task/:taskid (DELETE) type=soft other User', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}/task/${exampleTask._id}?type=hard`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)
      return res
    })

    // Negativ test
    it('/set/:id/task/:taskid (DELETE) type=soft other User', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}/task/${wrongId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404)
      return res
    })

    it('/set/:id/task/:taskid (DELETE) type=soft own User', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}/task/${exampleTask._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body.daresCount === 0).toBeTruthy()
      expect(res.body.truthCount === 0).toBeTruthy()
      return res
    })

    // Negative test
    it('/set/:id/task/:taskid (DELETE) type=soft wrongId', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}/task/${wrongId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
      return res
    })

    it('/set/:id (DELETE) type=soft own User', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)
      return res
    })

    // Negative test
    it('/set/:id (DELETE) type=soft own User', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/set/${wrongId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
      return res
    })

    // Test cancel because error gets thrown in console
    it('/set/:id (DELETE) type=soft other User', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/set/${setId2}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404)
      return res
    })

    // Test cancel because error gets thrown in console
    it('/set/:id (DELETE) type=hard user', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}?type=hard`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
      return res
    })

    // TODO: This is a security breach (November 14th 2021)
    it('/user/testing (PATCH) Change to Admin', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/user/testing/${exampleSet.createdBy._id}`)
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
          email: "Hahaxd@gmail.com",
          password: "12345678"
        })
        .expect(201)

      // Admin token
      token = (await res).body.access_token
      return res
    })

    it('/set/:id (DELETE) type=soft admin', async () => {
      const res = await request(app.getHttpServer())
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
    it('/set/:id/task/:taskid (DELETE) type=hard admin', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}/task/${exampleTask._id}?type=hard`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      expect(res.body.truthCount == 0).toBeTruthy()
      expect(res.body.daresCount == 0).toBeTruthy()
      return res

    })

    it('/set/:id (DELETE) type=hard', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}?type=hard`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)
      return res
    })

    it('/set/:id (DELETE) type=hard', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/set/${setId2}?type=hard`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)
      return res
    })

    /*---------------------\ 
    |       MockData       |
    \---------------------*/

    it('/migrate (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/set/migrate?test=true`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201)
      return res
    })

    // Delete Admin user
    it('/user/:id (DELETE)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/user/${exampleSet.createdBy._id}`)
        .expect(200)
      return res
    })

    // Delete other user
    it('/user/:id (DELETE)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/user/${otherUserId}`)
        .expect(200)
      return res
    })

  })

});

