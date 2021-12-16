import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
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
        .expect(HttpStatus.CREATED)

      token = res.body.access_token
    })

    it('/user/profile (GET)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK)

      exampleSet.createdBy._id = res.body.userId

    })

    it('/auth/register (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: "Hahaxd2",
          email: "Hahaxd2@gmail.com",
          password: "12345678"
        })
        .expect(HttpStatus.CREATED)

      otherToken = res.body.access_token
    })

    it('/user/profile (GET)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(HttpStatus.OK)

      otherUserId = res.body.userId
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
        .expect(HttpStatus.CREATED)
      expect(res.body.language).toEqual(exampleSet.language)
      expect(res.body.name).toEqual(exampleSet.name)
      // Expect to have the format of ResponseSet
      expect([res.body._id, res.body.daresCount, res.body.truthCount, res.body.language, res.body.name, res.body.createdBy._id, res.body.createdBy.username, res.body.previewImage, res.body.bannerImage]).toBeDefined()
      expect(res.body.status).toBeUndefined()
      // Update example set
      exampleSet._id = res.body._id
    })

    it('/set (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/set')
        .set('Authorization', `Bearer ${token}`)
        .send({
          language: "de",
          name: "super cool set"
        })
        .expect(HttpStatus.CREATED)
      setId2 = (res.body._id)
      expect(setId2 == exampleSet._id).toBeFalsy()
    })

    // Negative test
    it('/set (POST)', async () => {
      await request(app.getHttpServer())
        .post('/api/set')
        .set('Authorization', `Bearer ${token}`)
        .send({
          language: "wrong",
          name: "Doesn't matter"
        })
        .expect(HttpStatus.BAD_REQUEST)
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
        .expect(HttpStatus.OK)
      expect(res.body.length === 2).toBeTruthy()
    })

    it('/set/:id (GET)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/set/${exampleSet._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK)
      expect(res.body).toEqual({ ...exampleSet, tasks: [] })
    })

    it('/set/:id (PATCH)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/set/${exampleSet._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          language: Language.EN,
          name: "English Set"
        })
        .expect(HttpStatus.OK)

      expect(res.body.language).toEqual(Language.EN)
      expect(res.body.name).toEqual("English Set")
      exampleSet.language = res.body.language
      exampleSet.name = res.body.name

    })

    // Negative test
    it('/set/:id (PATCH)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/set/${exampleSet._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          language: "adsa"
        })
        .expect(HttpStatus.BAD_REQUEST)
    })

    // Negative test
    it('/set/:id (GET)', async () => {
      await request(app.getHttpServer())
        .get(`/api/set/${wrongId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND)
    })

    // Negative test
    it('/set/:id (PATCH)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/set/${wrongId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND)
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
        .expect(HttpStatus.CREATED)
      exampleTask._id = res.body._id

      // Check if the count has been updated
      const res2 = await request(app.getHttpServer())
        .get(`/api/set/${exampleSet._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK)
      expect(res2.body.truthCount === 1).toBeTruthy()
      expect(exampleTask).toEqual(res.body)
    })

    // Negative test
    it('/set/:id/task (POST)', async () => {
      await request(app.getHttpServer())
        .post(`/api/set/${wrongId}/task`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('/set/:id/task/:taskid (PUT)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/set/${exampleSet._id}/task/${exampleTask._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: TaskType.DARE,
          currentPlayerGender: exampleTask.currentPlayerGender,
          message: exampleTask.message
        })
        .expect(HttpStatus.OK)
      expect(res.body.daresCount === 1).toBeTruthy()
      expect(res.body.truthCount === 0).toBeTruthy()
    })

    // Negative test
    it('/set/:id/task/:taskid (PUT)', async () => {
      await request(app.getHttpServer())
        .put(`/api/set/${exampleSet._id}/task/${wrongId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: "dare",
          currentPlayerGender: exampleTask.currentPlayerGender,
          message: exampleTask.message
        })
        .expect(HttpStatus.NOT_FOUND)
    })

    /*----------------------\ 
    |        Deletes        |
    \----------------------*/

    // Negativ test
    it('/set/:id/task/:taskid (DELETE) type=soft other User', async () => {
      await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}/task/${exampleTask._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(HttpStatus.NOT_FOUND)
    })

    // Negativ test
    it('/set/:id/task/:taskid (DELETE) type=soft other User', async () => {
      await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}/task/${exampleTask._id}?type=hard`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(HttpStatus.FORBIDDEN)
    })

    // Negativ test
    it('/set/:id/task/:taskid (DELETE) type=soft other User', async () => {
      await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}/task/${wrongId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(HttpStatus.NOT_FOUND)
    })

    it('/set/:id/task/:taskid (DELETE) type=soft own User', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}/task/${exampleTask._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK)

      expect(res.body.daresCount === 0).toBeTruthy()
      expect(res.body.truthCount === 0).toBeTruthy()
    })

    // Negative test
    it('/set/:id/task/:taskid (DELETE) type=soft wrongId', async () => {
      await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}/task/${wrongId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND)
    })

    it('/set/:id (DELETE) type=soft own User', async () => {
      await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NO_CONTENT)
    })

    // Negative test
    it('/set/:id (DELETE) type=soft own User', async () => {
      await request(app.getHttpServer())
        .delete(`/api/set/${wrongId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND)
    })

    // Test cancel because error gets thrown in console
    it('/set/:id (DELETE) type=soft other User', async () => {
      await request(app.getHttpServer())
        .delete(`/api/set/${setId2}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(HttpStatus.NOT_FOUND)
    })

    // Test cancel because error gets thrown in console
    it('/set/:id (DELETE) type=hard user', async () => {
      await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}?type=hard`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.FORBIDDEN)
    })

    // TODO: This is a security breach (November 14th 2021)
    it('/user/testing (PATCH) Change to Admin', async () => {
      await request(app.getHttpServer())
        .patch(`/api/user/testing/${exampleSet.createdBy._id}`)
        .send({
          role: "admin"
        })
        .expect(HttpStatus.OK)
    })

    it('/auth/login (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: "Hahaxd@gmail.com",
          password: "12345678"
        })
        .expect(HttpStatus.CREATED)

      // Admin token
      token = res.body.access_token
    })

    it('/set/:id (DELETE) type=soft admin', async () => {
      await request(app.getHttpServer())
        .delete(`/api/set/${setId2}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NO_CONTENT)
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
        .expect(HttpStatus.OK)
      expect(res.body.truthCount == 0).toBeTruthy()
      expect(res.body.daresCount == 0).toBeTruthy()

    })

    it('/set/:id (DELETE) type=hard', async () => {
      await request(app.getHttpServer())
        .delete(`/api/set/${exampleSet._id}?type=hard`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NO_CONTENT)
    })

    it('/set/:id (DELETE) type=hard', async () => {
      await request(app.getHttpServer())
        .delete(`/api/set/${setId2}?type=hard`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NO_CONTENT)
    })

    /*---------------------\ 
    |       MockData       |
    \---------------------*/

    it('/migrate (POST)', async () => {
      await request(app.getHttpServer())
        .post(`/api/set/migrate?test=true`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.CREATED)
    })

    // Delete Admin user
    it('/user/:id (DELETE)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/user/${exampleSet.createdBy._id}`)
        .expect(HttpStatus.OK)
    })

    // Delete other user
    it('/user/:id (DELETE)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/user/${otherUserId}`)
        .expect(HttpStatus.OK)
    })

  })

});

