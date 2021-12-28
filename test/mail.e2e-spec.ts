'use strict';
//NestJS imports
//project imports
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
//node imports
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { MailModule } from '../src/mail/mail.module';
import { UserDocument } from '../src/user/entities/user.entity';
import { UserModule } from '../src/user/user.module';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/mongo-memory-helpers';
import { getJWT, getTestUser } from './__mocks__/user-mock-data';

const { mock } = require('nodemailer');

let app: NestExpressApplication;
let token: string;
let connection: Connection;
let userModel: Model<UserDocument>;

beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
            rootMongooseTestModule(),
            UserModule,
            AuthModule,
            MailModule,
            ConfigModule.forRoot({
                envFilePath: ['.env', '.development.env']
            })
        ]
    }).compile();

    connection = await moduleFixture.get(getConnectionToken());
    userModel = connection.model('User');

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
});

beforeEach(async () => {
    await userModel.deleteMany();
    // mockmailer should be reset and not throw artificial errors
    mock.reset();
    mock.setShouldFail(false);
});

describe('MailModule', () => {
    describe('sendMail', () => {
        describe('Mail basics', () => {
            it('should return HttpStatus.CREATED to valid request', async () => {
                await request(app.getHttpServer())
                    .post('/mail')
                    .set('Content-Type', 'application/json')
                    .send({
                        recipient: 'unit1@test.mock'
                    })
                    .expect(HttpStatus.CREATED);
            });

            it('should send email', async () => {
                await request(app.getHttpServer())
                    .post('/mail')
                    .set('Content-Type', 'application/json')
                    .send({
                        recipient: 'unit2@test.mock'
                    });

                const sendMails = mock.getSentMail();

                expect(sendMails.length).toBe(1);
            });

            it('should send email with test content', async () => {
                await request(app.getHttpServer())
                    .post('/mail')
                    .set('Content-Type', 'application/json')
                    .send({
                        recipient: 'unit2@test.mock'
                    })
                    .expect(HttpStatus.CREATED);

                const receivedMail = mock.getSentMail()[0];

                expect(receivedMail.subject).toBe('test');
                expect(receivedMail.html).toBe('this is a dummy endpoint');
            });

            it('should return an error if Mail fails to send', async () => {
                mock.setShouldFail(true);
                await request(app.getHttpServer())
                    .post('/mail')
                    .set('Content-Type', 'application/json')
                    .send({
                        recipient: 'unit2@test.mock'
                    })
                    .expect(HttpStatus.SERVICE_UNAVAILABLE);
            });
        });

        describe('generateVerifyMail', () => {
            it('/auth/register (POST) should send mail verification', async () => {
                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({
                        username: 'unit test',
                        email: 'dummy@unit.test',
                        password: 'verysecurepassword'
                    })
                    .expect(HttpStatus.CREATED);

                //checking send mail (content is ignored as this would make changing templates annoying)
                const sendMails = mock.getSentMail();
                expect(sendMails.length).toBe(1);
                expect(sendMails[0].to).toBe('dummy@unit.test');
            });

            it('/user/get-verify (POST) should send mail verification', async () => {
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .get('/user/resend-account-verification')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.OK);

                //checking send mail (content is ignored as this would make changing templates annoying)
                const sendMails = mock.getSentMail();
                expect(sendMails.length).toBe(1);
                expect(sendMails[0].to).toBe('mock@mock.mock');
            });

            it('/auth/register (POST) should fail on mailserver fail', async () => {
                mock.setShouldFail(true);
                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({
                        username: 'unit test',
                        email: 'dummy@unit.test',
                        password: 'verysecurepassword'
                    })
                    .expect(HttpStatus.SERVICE_UNAVAILABLE);
            });
        });
    });
});

afterAll(async () => {
    await connection.close();
    closeInMongodConnection();
    await app.close();
    await app.close();
});
