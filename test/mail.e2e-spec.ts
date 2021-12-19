'use strict'
//NestJS imports
import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';

//node imports
import * as request from 'supertest'

//project imports
import { AppModule } from './../src/app.module';
import { HttpStatus } from '@nestjs/common';

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

    it("should return HttpStatus.CREATED to valid request", async () => {

        await request(app.getHttpServer())
        .post('/mail')
        .set("Content-Type", "application/json")
        .send({
            recipient: "unit1@test.mock"
        })
        .expect(HttpStatus.CREATED)
    })

    it("should send email", async () => {
      await request(app.getHttpServer())
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
      .expect(HttpStatus.CREATED)

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
      .expect(HttpStatus.SERVICE_UNAVAILABLE)
    })
})

describe("generateVerifyMail", () => {
  it('/auth/register (POST) should send mail verification', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: "unit test",
        email: "dummy@unit.test",
        password: "verysecurepassword"
      })
      .expect(HttpStatus.CREATED)

      token = res.body.access_token

      //checking send mail (content is ignored as this would make changing templates annoying)
      const sendMails =  mock.getSentMail()    
      expect(sendMails.length).toBe(1)
      expect(sendMails[0].to).toBe("dummy@unit.test")
    })  
})

afterAll(async () => {
    const res = await request(app.getHttpServer())
      .get('/user/profile')
      .set('Authorization', `Bearer ${token}`)

    let userId = res.body.userId

    await request(app.getHttpServer())
      .delete(`/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)

    await app.close()
})
