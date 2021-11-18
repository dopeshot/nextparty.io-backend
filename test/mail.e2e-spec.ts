'use strict'
//NestJS imports
import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';

//node imports
import * as request from 'supertest'

//project imports
import { AppModule } from './../src/app.module';

const { mock } = require('nodemailer');

let app: NestExpressApplication
let token: string

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
})

beforeEach( async () => {

    // mockmailer should be reset and not throw artificial errors
    mock.reset()
    mock.setShouldFail(false)
})

describe("sendMail", () => {

    it("should return 201 to valid request", async () => {

        const res = await request(app.getHttpServer())
        .post('/mail')
        .set("Content-Type", "application/json")
        .send({
            recipient: "unit1@test.mock"
        })
        .expect(201)
    })

    it("should send email", async () => {
      const res = await request(app.getHttpServer())
      .post('/mail')
      .set("Content-Type", "application/json")
      .send({
          recipient: "unit2@test.mock"
      })

      const sendMails = mock.getSentMail()

      expect(sendMails.length).toBe(1)
    })

    it("should send email with test content", async () => {
      await request(app.getHttpServer())
      .post('/mail')
      .set("Content-Type", "application/json")
      .send({
          recipient: "unit2@test.mock"
      })
      .expect(201)

      const receivedMail = mock.getSentMail()[0]

      expect(receivedMail.subject).toBe("test")
      expect(receivedMail.html).toBe("this is a dummy endpoint")
    })

    it("should return an error if Mail fails to send", async () => {
      mock.setShouldFail(true)
      await request(app.getHttpServer())
      .post('/mail')
      .set("Content-Type", "application/json")
      .send({
          recipient: "unit2@test.mock"
      })
      .expect(500)
    })
})

describe("generateVerifyMail", () => {
  it('/auth/register (POST) should send mail verification', async () => {
    const res = request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: "unit test",
        email: "dummy@unit.test",
        password: "verysecurepassword"
      })
      .expect(201)

      token = (await res).body.access_token

      //checking send mail (content is ignored as this would make changing templates annoying)
      const sendMails =  mock.getSentMail()    
      expect(sendMails.length).toBe(1)
      expect(sendMails[0].to).toBe("dummy@unit.test")
    })  
})

describe("sendPasswordReset", () => {
  it('/user/password-reset (GET) should send password reset email', async () => {
    await request(app.getHttpServer())
      .get('/user/password-reset')
      .send({
        userMail: "dummy@unit.test"
      })
      .expect(200)

      
      //checking send mail (content is ignored as this would make changing templates annoying)
      const sendMails =  mock.getSentMail()
      expect(sendMails.length).toBe(1)
      expect(sendMails[0].to).toBe("dummy@unit.test")
    })  
})


afterAll(async () => {
    let res = request(app.getHttpServer())
      .get('/user/profile')
      .set('Authorization', `Bearer ${token}`)

    let userId = (await res).body.userId

    await request(app.getHttpServer())
      .delete(`/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)

    await app.close()
})
