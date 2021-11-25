import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

describe('AppController (e2e)', () => {
  // This has to be nestexpress otherwise endpoints with render will throw 500
  let app: NestExpressApplication
  let token
  let userId
  let verifyCode:string
  let resetCode:string


  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.setBaseViewsDir(join(__dirname, '..', 'views'))
    app.setViewEngine('ejs')
    await app.init();
  });

  describe('Auth and User', () => {
    it('/auth/register (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: "Zoe",
          email: "zoe@gmail.com",
          password: "12345678"
        })
        .expect(201)

      token = res.body.access_token
      return res
    })
    
    it('/auth/register (POST) duplicate mail', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: "not Zoe",
          email: "zoe@gmail.com",
          password: "12345678"
        })
        .expect(409)
      return res
    })

    it('/auth/register (POST) duplicate username', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: "Zoe",
          email: "NotZoe@gmail.com",
          password: "12345678"
        })
        .expect(409)
      return res
    })

    it('/auth/login (POST)', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "zoe@gmail.com",
          password: "12345678"
        })
        .expect(201)
    })

    it('/auth/login (POST) Wrong Password', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "zoe@gmail.com",
          password: "123"
        })
        .expect(401)
    })

    it('/user/profile (GET)', async () => {
      const res = request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      userId = (await res).body.userId
      return res
    })

    it('/getVerify (GET) rerequest verify', async () => {
      const res = request(app.getHttpServer())
      .get('/user/getVerify')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      return res
    })
  })

  describe("Roles", () => {
    it('/user (GET) Protected Route: No Admin Role', async () => {
      const res = request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
      return res
    })

    it('/user/testing (PATCH) Change to Admin', async () => {
      const res = request(app.getHttpServer())
        .patch(`/user/testing/${userId}`)
        .send({
          role: "admin"
        })
        .expect(200)
      return res
    })

    it('/auth/login (POST)', async () => {
      const res = request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: "zoe@gmail.com",
        password: "12345678"
      })
      .expect(201)

      token = (await res).body.access_token
      return res
    })

    it('/user/verify (GET) Protected Route: Admin Role', async () => {
      const res = await request(app.getHttpServer())
        .get('/user/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: userId
        })
        .expect(200)
      
      verifyCode = (await res).body.verificationCode
      return res
      
    })

    it('/user/password-reset (GET)', async () => {
      const res = request(app.getHttpServer())
        .get('/user/password-reset')
        .send({
          userMail: "zoe@gmail.com"
        })
        .expect(200)
      return res
    })

    it('/user/reset (GET) Protected Route: Admin Role', async () => {
      const res = await request(app.getHttpServer())
        .get('/user/reset')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: userId
        })
        .expect(200)
      
      resetCode = (await res).body.verificationCode
      return res
    })

    it('/user (GET) Protected Route: Admin Role', async () => {
      const res = request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      return res
    })

    it('/user/:id (PATCH)', async () => {
      const res = request(app.getHttpServer())
      .patch('/user/'+userId)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: "AlsoZoe@gmail.com"
      })
      .expect(200)

      token = (await res).body.access_token
      return res
    })   
  })

  describe('Verify and Password', () => {
    it('user/verify/:id (GET) verify user', async () => {
      const res = await request(app.getHttpServer())
      .get('/user/verify/'+verifyCode)
      .expect(200)
      return res
    })

    it('user/verify/:id (GET) error if invalid code', async () => {
      const res = await request(app.getHttpServer())
      .get('/user/verify/invalidCode')
      .expect(404)
      return res
    })

    it('user/reset-form/:id (GET)', async () => {
      const res = await request(app.getHttpServer())
      .get('/user/reset-form/'+resetCode)
      .expect(200)
      return res
    })

    it('user/submitReset (POST) should set new password', async () => {
      const init = await request(app.getHttpServer())
      .post('/user/submitReset')
      .send({
        password: "new password", 
        code: resetCode
      })
      .expect(201)
      
      const res = request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: "zoe@gmail.com",
        password: "new password"
      })
      .expect(201)

      token = (await res).body.access_token
      return res
    })

    it('user/submitReset (POST) should return 404 if invalid code', async () => {
      const res = await request(app.getHttpServer())
      .post('/user/submitReset')
      .send({
        password: "new password", 
        code: "invalid :("
      })
      .expect(404)
      return res
    })
  })

  describe('Cleanup', () => {
    it('/user/:id (DELETE)', async () => {
      const res = request(app.getHttpServer())
        .delete(`/user/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      return res
    })
  })

  afterAll(async () => {
    await app.close();
  });
});
