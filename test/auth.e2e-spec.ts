import { MailerModule } from '@nestjs-modules/mailer';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { userInfo } from 'os';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthModule } from '../src/auth/auth.module';
import { DiscordAuthGuard } from '../src/auth/strategies/discord/discord-auth.guard';
import { FacebookAuthGuard } from '../src/auth/strategies/facebook/facebook-auth.guard';
import { GoogleAuthGuard } from '../src/auth/strategies/google/google-auth.guard';
import { Status } from '../src/shared/enums/status.enum';
import { UserDocument } from '../src/user/entities/user.entity';
import { UserStatus } from '../src/user/enums/status.enum';
import { UserModule } from '../src/user/user.module';
import { ThirdPartyGuardMock } from './helpers/fake-provider-strategy';
import { ProviderGuardFaker } from './helpers/fake-third-party-guard';
import {
    rootMongooseTestModule,
    closeInMongodConnection
} from './helpers/mongoMemoryHelpers';
import { getJWT, getTestUser } from './__mocks__/user-mock-data';
const { mock } = require('nodemailer');

describe('AuthMdoule (e2e)', () => {
    let app: INestApplication;
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
        })
            .overrideGuard(GoogleAuthGuard) // Overwrite guards with mocks that don´t rely on external APIs
            .useClass(ProviderGuardFaker)
            .overrideGuard(FacebookAuthGuard)
            .useClass(ProviderGuardFaker)
            .overrideGuard(DiscordAuthGuard)
            .useClass(ProviderGuardFaker)
            .compile();

        connection = await module.get(getConnectionToken());
        userModel = connection.model('User');
        app = module.createNestApplication();
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

    describe('Auth basics', () => {
        describe('/auth/register (POST)', () => {
            it('/auth/register (POST)', async () => {
                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({
                        username: 'fictional user',
                        email: 'fictional@gmail.com',
                        password: '12345678'
                    })
                    .expect(HttpStatus.CREATED);
            });

            it('/auth/register (POST) duplicate mail', async () => {
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({
                        username: 'a mock user',
                        email: 'mock@mock.mock',
                        password: 'mensa essen'
                    })
                    .expect(HttpStatus.CONFLICT);
            });

            it('/auth/register (POST) duplicate username', async () => {
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({
                        username: 'mock',
                        email: 'notMock@mock.mock',
                        password: 'mensa essen'
                    })
                    .expect(HttpStatus.CONFLICT);
            });
        });

        describe('/auth/(third-party-provider) (GET)', () => {
            it('/auth/google/redirect should create user', async () => {
                // send data that normally is provided by guard
                await request(app.getHttpServer())
                    .get('/auth/google/redirect')
                    .send({
                        user: {
                            username: 'googleman',
                            email: 'googleuser@google.com',
                            provider: 'google'
                        }
                    })
                    .expect(HttpStatus.OK);
                expect(await (await userModel.find()).length).toBe(1);
            });

            it('/auth/facebook/redirect should create user', async () => {
                // send data that normally is provided by guard
                await request(app.getHttpServer())
                    .get('/auth/facebook/redirect')
                    .send({
                        user: {
                            username: 'meta slave',
                            email: 'face@book.com',
                            provider: 'face'
                        }
                    })
                    .expect(HttpStatus.OK);
                expect(await (await userModel.find()).length).toBe(1);
            });

            it('/auth/discord/redirect should create user', async () => {
                // send data that normally is provided by guard
                await request(app.getHttpServer())
                    .get('/auth/discord/redirect')
                    .send({
                        user: {
                            username: 'discorduser',
                            email: 'user@discord.com',
                            provider: 'discord'
                        }
                    })
                    .expect(HttpStatus.OK);
                expect(await (await userModel.find()).length).toBe(1);
            });

            it('/auth/(can be used for login)/redirect can be used for login (given user has provider)', async () => {
                // add provide to test user
                let user = await getTestUser();
                user = { ...user, provider: 'google' };
                await userModel.create(user);
                // send data that normally is provided by guard
                await request(app.getHttpServer())
                    .get('/auth/discord/redirect')
                    .send({
                        user: {
                            username: 'mock',
                            email: 'mock@mock.mock',
                            provider: 'google'
                        }
                    })
                    .expect(HttpStatus.OK);
                expect(await (await userModel.find()).length).toBe(1);
            });

            it('/auth/(any third party)/redirect should throw error on duplicate', async () => {
                // send data that normally is provided by guard
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .get('/auth/google/redirect')
                    .send({
                        user: {
                            username: 'mock',
                            email: 'mock@mock.mock',
                            provider: 'google'
                        }
                    })
                    .expect(HttpStatus.CONFLICT);
                expect(await (await userModel.find()).length).toBe(1);
            });

            it('/auth/(any third party)/redirect should throw error on duplicate username', async () => {
                // send data that normally is provided by guard
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .get('/auth/google/redirect')
                    .send({
                        user: {
                            username: 'mock',
                            email: 'not@mock.mock',
                            provider: 'google'
                        }
                    })
                    .expect(HttpStatus.INTERNAL_SERVER_ERROR);
                expect(await (await userModel.find()).length).toBe(1);
            });

            it('/auth/(any third party)/redirect should fail without values', async () => {
                // send data that normally is provided by guard
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .get('/auth/google/redirect')
                    .send({})
                    .expect(HttpStatus.UNAUTHORIZED);
            });
        });

        describe('/auth/login (POST)', () => {
            it('/auth/login (POST)', async () => {
                await userModel.create(await getTestUser());
                return request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        email: 'mock@mock.mock',
                        password: 'mock password'
                    })
                    .expect(HttpStatus.CREATED);
            });

            it('/auth/login (POST) Wrong Password', async () => {
                await userModel.create(await getTestUser());
                return request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        email: 'mock@mock.mock',
                        password: 'my grandmas birthday'
                    })
                    .expect(HttpStatus.UNAUTHORIZED);
            });

            it('/auth/login (POST) Wrong Email', async () => {
                await userModel.create(await getTestUser());
                return request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        email: 'peter@mock.mock',
                        password: 'mock password'
                    })
                    .expect(HttpStatus.UNAUTHORIZED);
            });

            it('/auth/login (POST) User uses provider for login', async () => {
                // add provide to test user
                let user = await getTestUser();
                user = { ...user, provider: 'google' };
                await userModel.create(user);

                return request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        email: 'mock@mock.mock',
                        password: 'mock password'
                    })
                    .expect(HttpStatus.UNAUTHORIZED);
            });
        });
    });

    describe('Guard', () => {
        describe('JWT Guard', () => {
            it('Guard should block with invalid token', async () => {
                await request(app.getHttpServer())
                    .get('/user')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.UNAUTHORIZED);
            });

            it('Guard should block when user is banned ', async () => {
                let user = await getTestUser();
                user = { ...user, status: UserStatus.BANNED };
                await userModel.create(user);
                await request(app.getHttpServer())
                    .get('/user')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.UNAUTHORIZED);
            });
        });
    });
});
