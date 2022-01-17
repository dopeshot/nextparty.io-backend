import { MailerModule } from '@nestjs-modules/mailer';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { join } from 'path';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { UserDocument } from '../src/user/entities/user.entity';
import { UserStatus } from '../src/user/enums/status.enum';
import { UserResponse } from '../src/user/responses/user-response';
import { UserModule } from '../src/user/user.module';
import { ThirdPartyGuardMock } from './helpers/fake-provider-strategy';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/mongo-memory-helpers';
import {
    getJWT,
    getTestAdmin,
    getTestUser,
    getUserReset,
    getUserVerify
} from './__mocks__/user-mock-data';
const { mock } = require('nodemailer');

describe('UserModule (e2e)', () => {
    let app: NestExpressApplication;
    let connection: Connection;
    let userModel: Model<UserDocument>;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                UserModule,
                AuthModule,
                MailerModule,
                ConfigModule.forRoot({
                    envFilePath: ['.env', '.development.env']
                })
            ],
            providers: [ThirdPartyGuardMock]
        }).compile();

        connection = await module.get(getConnectionToken());
        userModel = connection.model('User');

        // Using a full nest application is necessary
        // https://github.com/jmcdo29/testing-nestjs/commit/0544f34ce02c1a42179aae7f36cb11fb3b62fb22
        // https://github.com/jmcdo29/testing-nestjs/issues/74
        app = module.createNestApplication<NestExpressApplication>();
        app.setBaseViewsDir(join(__dirname, '..', 'views'));
        app.setViewEngine('ejs');
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    // Insert test data
    beforeEach(async () => {});

    // Empty the collection from all possible impurities
    afterEach(async () => {
        await userModel.deleteMany();
    });

    afterAll(async () => {
        await connection.close();
        closeInMongodConnection();
        await app.close();
    });

    describe('User basics', () => {
        describe('/users (GET)', () => {
            it('/users (GET) should return array', async () => {
                let user = await getTestAdmin();
                await userModel.insertMany([user]);
                const res = await request(app.getHttpServer())
                    .get('/users')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestAdmin())}`
                    )
                    .expect(HttpStatus.OK);

                expect(res.body.length).toBe(1);

                // test user response
                const usr = new UserResponse(res.body);
                expect(res.body).toMatchObject(usr);
            });
        });

        describe('/users/profile (GET)', () => {
            it('/users/profile (GET) ', async () => {
                let user = await getTestUser();
                await userModel.create(user);
                const res = await request(app.getHttpServer())
                    .get('/users/profile')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.OK);

                // test user response
                const response = new UserResponse(res.body[0]);
                expect(res.body).toMatchObject(response);
            });
        });

        describe('/users/get-verify (GET)', () => {
            it('/users/get-verify (GET) ', async () => {
                await userModel.create(await getTestUser());
                request(app.getHttpServer())
                    .get('/users/resend-account-verification')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.OK);
            });

            it('/users/get-verify (GET) should fail with invalid token', async () => {
                await request(app.getHttpServer())
                    .get('/users/resend-account-verification')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.UNAUTHORIZED);
            });
        });

        describe('/users/:id (PATCH)', () => {
            it('/users/:id (PATCH) should patch user', async () => {
                await userModel.create(await getTestUser());
                const res = await request(app.getHttpServer())
                    .patch('/users/61bb7c9983fdff2f24bf77a8')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .send({
                        username: 'test-user-updated'
                    })
                    .expect(HttpStatus.OK);
                let user = await userModel.findOne();
                expect(user.username).toBe('test-user-updated');
                // test user response
                const response = new UserResponse(res.body[0]);
                expect(res.body).toMatchObject(response);
            });

            it('/users/:id (PATCH) should fail with duplicate', async () => {
                await userModel.create(await getTestUser());
                await userModel.create(await getTestAdmin());
                await request(app.getHttpServer())
                    .patch('/users/61bb7c9983fdff2f24bf77a8')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .send({
                        username: 'admin'
                    })
                    .expect(HttpStatus.CONFLICT);
            });

            it('/users/:id (PATCH) should fail when patching other user', async () => {
                await userModel.create(await getTestUser());
                await userModel.create(await getTestAdmin());
                await request(app.getHttpServer())
                    .patch('/users/61bb7c9883fdff2f24bf779d')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.FORBIDDEN);
            });
        });

        describe('/users/:id (DELETE)', () => {
            it('/users/:id (DELETE) should delete user', async () => {
                let user = await getTestUser();
                await userModel.create(user);
                const res = await request(app.getHttpServer())
                    .delete('/users/61bb7c9983fdff2f24bf77a8')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.NO_CONTENT);
                expect((await userModel.find()).length).toBe(0);
            });

            it('/users/:id (DELETE) should fail when deleting other user', async () => {
                await userModel.create(await getTestUser());
                await userModel.create(await getTestAdmin());
                await request(app.getHttpServer())
                    .delete('/users/61bb7c9883fdff2f24bf779d')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.FORBIDDEN);
            });
        });

        describe('/users/verify (GET)', () => {
            it('/users/verify (GET) should validate', async () => {
                let user = await getTestUser();
                user = { ...user, status: UserStatus.UNVERIFIED };
                await userModel.create(user);
                await request(app.getHttpServer())
                    .get(
                        `/users/verify-account/?code=${await getUserVerify(
                            user
                        )}`
                    )
                    .expect(HttpStatus.OK);

                expect((await userModel.findOne()).status).toBe(
                    UserStatus.ACTIVE
                );
            });

            it('/users/verify (GET) should fail with user that is not unverified', async () => {
                let user = await getTestUser();
                user = { ...user, status: UserStatus.BANNED };
                await userModel.create(user);
                await request(app.getHttpServer())
                    .get(
                        `/users/verify-account/?code=${await getUserVerify(
                            user
                        )}`
                    )
                    .expect(HttpStatus.UNAUTHORIZED);
            });

            it('/users/verify (GET) should fail with invalid user', async () => {
                let user = await getTestUser();
                user = { ...user, status: UserStatus.BANNED };
                await userModel.create(user);
                await request(app.getHttpServer())
                    .get(
                        `/users/verify-account/?code=${await getUserVerify(
                            await getTestAdmin()
                        )}`
                    )
                    .expect(HttpStatus.UNAUTHORIZED);
            });
        });

        describe('/users/request-password-reset (POST)', () => {
            it('/users/request-password-reset (POST) should work', async () => {
                let user = await getTestUser();
                await userModel.create(user);
                request(app.getHttpServer())
                    .post('/users/request-password-reset')
                    .send({
                        mail: user.email
                    })
                    .expect(HttpStatus.OK);
            });

            // No negative tests as no information should go out to any clients
        });

        describe('/users/reset-password (POST)', () => {
            it('/users/reset-password (POST) should set password', async () => {
                let user = await getTestUser();
                await userModel.create(user);
                const oldPassword = await (await userModel.findOne()).password;
                const res = await request(app.getHttpServer())
                    .post('/users/reset-password')
                    .send({
                        token: await getUserReset(user),
                        password: 'new password'
                    })
                    .expect(HttpStatus.CREATED);

                expect((await userModel.findOne()).password).not.toBe(
                    oldPassword
                );

                // Test return type
                const usr = new UserResponse(res.body);
                expect(res.body).toMatchObject(usr);
            });

            it('/users/reset-password (POST) should fail with invalid user', async () => {
                await request(app.getHttpServer())
                    .post('/users/reset-password')
                    .send({
                        token: await getUserReset(getTestUser),
                        password: 'new password'
                    })
                    .expect(HttpStatus.NOT_FOUND);
            });

            it('/users/reset-password (POST) should fail for user with provider', async () => {
                let user = await getTestUser();
                user = { ...user, provider: 'google' };
                await userModel.create(user);
                await request(app.getHttpServer())
                    .post('/users/reset-password')
                    .send({
                        token: await getUserReset(user),
                        password: 'new password'
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('/users/reset-password (POST) should fail with user that is not unverified', async () => {
                let user = await getTestUser();
                user = { ...user, status: UserStatus.UNVERIFIED };
                await userModel.create(user);
                await request(app.getHttpServer())
                    .post('/users/reset-password')
                    .send({
                        token: await getUserReset(user),
                        password: 'new password'
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });
        });
    });

    describe('Roles', () => {
        describe('Admin Role', () => {
            it('/users (GET) Protected Route: No Admin Role', async () => {
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .get('/users')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.FORBIDDEN);
            });

            it('/users (GET) using Admin', async () => {
                await userModel.insertMany([
                    await getTestUser(),
                    await getTestAdmin()
                ]);
                const res = request(app.getHttpServer())
                    .get('/users')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestAdmin())}`
                    )
                    .expect(HttpStatus.OK);

                expect((await res).body.length).toBe(2);
            });
        });
    });

    describe('Guard', () => {
        describe('JWTGuard', () => {
            it('/users/:id (DELETE) should fail with invalid token', async () => {
                await request(app.getHttpServer())
                    .delete('/users/61bb7c9983fdff2f24bf77a8')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.UNAUTHORIZED);
            });

            it('/users/profile (GET) should fail with invalid token', async () => {
                await request(app.getHttpServer())
                    .get('/users/profile')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.UNAUTHORIZED);
            });

            it('/users/:id (PATCH) should fail with invalid token', async () => {
                await request(app.getHttpServer())
                    .patch('/users/61bb7c9983fdff2f24bf77a8')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.UNAUTHORIZED);
            });
        });

        describe('VerifyJWTGuard', () => {
            it('/users/verify (GET) should fail with invalid token', async () => {
                let user = await getTestUser();
                user = { ...user, status: UserStatus.UNVERIFIED };
                await userModel.create(user);
                await request(app.getHttpServer())
                    .get(
                        `/users/verify-account/?code=${await getUserVerify(
                            await getTestAdmin()
                        )}`
                    )
                    .expect(HttpStatus.UNAUTHORIZED);
            });
        });
    });
});
