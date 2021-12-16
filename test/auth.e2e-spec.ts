import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
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
        .expect(HttpStatus.CREATED)

      token = res.body.access_token
    })
    
    it('/auth/register (POST) duplicate mail', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: "not Zoe",
          email: "zoe@gmail.com",
          password: "12345678"
        })
        .expect(HttpStatus.CONFLICT)
    })

    it('/auth/register (POST) duplicate username', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: "Zoe",
          email: "NotZoe@gmail.com",
          password: "12345678"
        })
        .expect(HttpStatus.CONFLICT)
    })

    it('/auth/login (POST)', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "zoe@gmail.com",
          password: "12345678"
        })
        .expect(HttpStatus.CREATED)
    })

    it('/auth/login (POST) Wrong Password', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "zoe@gmail.com",
          password: "123"
        })
        .expect(HttpStatus.UNAUTHORIZED)
    })

    it('/user/profile (GET)', async () => {
      const res = await request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK)
      userId = res.body.userId
    })

    it('/getVerify (GET) rerequest verify', async () => {
      await request(app.getHttpServer())
      .get('/user/getVerify')
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK)
    })
  })

  describe("Roles", () => {
    it('/user (GET) Protected Route: No Admin Role', async () => {
      await request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.FORBIDDEN)
    })

    it('/user/testing (PATCH) Change to Admin', async () => {
      await request(app.getHttpServer())
        .patch(`/user/testing/${userId}`)
        .send({
          role: "admin"
        })
        .expect(HttpStatus.OK)
    })

    it('/auth/login (POST)', async () => {
      const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: "zoe@gmail.com",
        password: "12345678"
      })
      .expect(HttpStatus.CREATED)

      token = res.body.access_token
    })

    it('/user/verify (GET) Protected Route: Admin Role', async () => {
      const res = await request(app.getHttpServer())
        .get('/user/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: userId
        })
        .expect(HttpStatus.OK)
      
      verifyCode = res.body.verificationCode
      
    })

    it('/user/password-reset (GET)', async () => {
      await request(app.getHttpServer())
        .get('/user/password-reset')
        .send({
          userMail: "zoe@gmail.com"
        })
        .expect(HttpStatus.OK)
    })

    it('/user/reset (GET) Protected Route: Admin Role', async () => {
      const res = await request(app.getHttpServer())
        .get('/user/reset')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: userId
        })
        .expect(HttpStatus.OK)
      
      resetCode = res.body.verificationCode
    })

    it('/user (GET) Protected Route: Admin Role', async () => {
      await request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK)
    })

    it('/user/:id (PATCH)', async () => {
      const res = await request(app.getHttpServer())
      .patch('/user/'+userId)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: "AlsoZoe@gmail.com"
      })
      .expect(HttpStatus.OK)

      token = res.body.access_token
    })   
  })

  describe('Verify and Password', () => {
    it('user/verify/:id (GET) verify user', async () => {
      await request(app.getHttpServer())
      .get('/user/verify/'+verifyCode)
      .expect(HttpStatus.OK)
    })

    it('user/verify/:id (GET) error if invalid code', async () => {
      await request(app.getHttpServer())
      .get('/user/verify/invalidCode')
      .expect(HttpStatus.NOT_FOUND)
    })

    it('user/reset-form/:id (GET)', async () => {
      await request(app.getHttpServer())
      .get('/user/reset-form/'+resetCode)
      .expect(HttpStatus.OK)
    })

    it('user/submitReset (POST) should set new password', async () => {
      await request(app.getHttpServer())
      .post('/user/submitReset')
      .send({
        password: "new password", 
        code: resetCode
      })
      .expect(HttpStatus.CREATED)
      
      const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: "zoe@gmail.com",
        password: "new password"
      })
      .expect(HttpStatus.CREATED)

      token = res.body.access_token
    })

    it('user/submitReset (POST) should return HttpStatus.NOT_FOUND if invalid code', async () => {
      await request(app.getHttpServer())
      .post('/user/submitReset')
      .send({
        password: "new password", 
        code: "invalid :("
      })
      .expect(HttpStatus.NOT_FOUND)
    })
  })

  describe('Cleanup', () => {
    it('/user/:id (DELETE)', async () => {
      await request(app.getHttpServer())
        .delete(`/user/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK)
    })
  })

  afterAll(async () => {
    await app.close();
  });
});
