import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { JwtAuthGuard } from '../src/auth/strategies/jwt/jwt-auth.guard';
import { SetDocument } from '../src/set/entities/set.entity';
import { TaskType } from '../src/set/enums/tasktype.enum';
import { SetModule } from '../src/set/set.module';
import { Language } from '../src/shared/enums/language.enum';
import { Status } from '../src/shared/enums/status.enum';
import { UserSchema } from '../src/user/entities/user.entity';
import { FakeAuthGuardFactory } from './helpers/fakeAuthGuardFactory';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/mongoMemoryHelpers';
import {
    getMockAuthAdmin,
    getMockAuthUser,
    getMockSet,
    getMockTask,
    getSetSetupData,
    getString,
    getWrongId
} from './__mocks__/setMockData';

describe('Sets (e2e)', () => {
    let app: INestApplication;
    let setModel: Model<SetDocument>;
    let fakeAuthGuard = new FakeAuthGuardFactory();
    let connection: Connection;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                SetModule,
                MongooseModule.forFeature([
                    { name: 'User', schema: UserSchema }
                ])
            ]
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(fakeAuthGuard.getGuard())
            .compile();

        connection = await module.get(getConnectionToken());
        setModel = connection.model('Set');
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    beforeEach(async () => {
        await setModel.insertMany(getSetSetupData());
        fakeAuthGuard.setActive(true);
        fakeAuthGuard.setUser(getMockAuthUser());
    });

    afterEach(async () => {
        await setModel.deleteMany();
        fakeAuthGuard.setUser('');
    });

    afterAll(async () => {
        await connection.close();
        closeInMongodConnection();
    });

    describe('Set POST', () => {
        it('/set (POST) one set', async () => {
            const res = await request(app.getHttpServer())
                .post('/set')
                .send(getMockSet())
                .expect(HttpStatus.CREATED);
            expect((await setModel.find()).length).toBe(2);

            // Testing type ResponseSet
            const set = res.body;
            expect(set).toEqual(
                expect.objectContaining({
                    _id: expect.any(String),
                    language: expect.any(String),
                    dareCount: expect.any(Number),
                    truthCount: expect.any(Number),
                    createdBy: expect.any(Object),
                    name: expect.any(String),
                    previewImage: expect.any(String),
                    bannerImage: expect.any(String)
                })
            );
            expect(set).toEqual(
                expect.not.objectContaining({
                    status: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    __v: expect.any(String),
                    tasks: expect.any(Array)
                })
            );
        });

        // Negative test
        it('/set (POST) without auth', async () => {
            fakeAuthGuard.setActive(false);
            await request(app.getHttpServer())
                .post('/set')
                .send(getMockSet())
                .expect(HttpStatus.FORBIDDEN);
        });

        // Negative test
        it('/set (POST) wrong language', async () => {
            await request(app.getHttpServer())
                .post('/set')
                .send({ language: 'wrong', name: "Doesn't matter" })
                .expect(HttpStatus.BAD_REQUEST);
        });

        // Negative test
        it('/set (POST) with too short name', async () => {
            await request(app.getHttpServer())
                .post('/set')
                .send({ language: Language.DE, name: '12' })
                .expect(HttpStatus.BAD_REQUEST);
        });

        // Negative test
        it('/set (POST) with no name', async () => {
            await request(app.getHttpServer())
                .post('/set')
                .send({ language: Language.DE })
                .expect(HttpStatus.BAD_REQUEST);
        });

        // Negative test
        it('/set (POST) with number name', async () => {
            await request(app.getHttpServer())
                .post('/set')
                .send({ language: Language.DE, name: 2 })
                .expect(HttpStatus.BAD_REQUEST);
        });

        // Negative test
        it('/set (POST) with too long name', async () => {
            await request(app.getHttpServer())
                .post('/set')
                .send({
                    language: Language.DE,
                    name: '123456789012345678901234567890123'
                })
                .expect(HttpStatus.BAD_REQUEST);
        });
    });

    describe('Set GET', () => {
        it('/set (GET) all sets', async () => {
            const res = await request(app.getHttpServer())
                .get('/set')
                .expect(HttpStatus.OK);
            const sets = res.body;
            expect(sets.length === 1).toBeTruthy();

            // Testing type ResponseSet
            const set = sets[0];
            expect(set).toEqual(
                expect.objectContaining({
                    _id: expect.any(String),
                    language: expect.any(String),
                    dareCount: expect.any(Number),
                    truthCount: expect.any(Number),
                    createdBy: null,
                    name: expect.any(String),
                    previewImage: expect.any(String),
                    bannerImage: expect.any(String)
                })
            );
            expect(set).toEqual(
                expect.not.objectContaining({
                    status: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    __v: expect.any(String),
                    tasks: expect.any(Array)
                })
            );
        });

        it('/set/:id (GET) by id', async () => {
            const res = await request(app.getHttpServer())
                .get(`/set/${getSetSetupData()._id}`)
                .expect(HttpStatus.OK);

            // Testing type ResponseSet
            const set = res.body;
            expect(set).toEqual(
                expect.objectContaining({
                    _id: expect.any(String),
                    language: expect.any(String),
                    dareCount: expect.any(Number),
                    truthCount: expect.any(Number),
                    createdBy: null,
                    name: expect.any(String),
                    previewImage: expect.any(String),
                    bannerImage: expect.any(String),
                    tasks: expect.any(Array)
                })
            );
            expect(set).toEqual(
                expect.not.objectContaining({
                    status: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    __v: expect.any(String)
                })
            );

            // Testing type ResponseTask
            const task = set.tasks[0];
            expect(task).toEqual(
                expect.objectContaining({
                    _id: expect.any(String),
                    type: expect.any(String),
                    message: expect.any(String),
                    currentPlayerGender: expect.any(String)
                })
            );
            expect(task).toEqual(
                expect.not.objectContaining({
                    __v: expect.any(String),
                    status: expect.any(String),
                    createdAt: expect.any(Date),
                    createdBy: expect.any(Date)
                })
            );

            // Testing content
            task['status'] = Status.ACTIVE;
            expect({
                ...set,
                createdBy: getSetSetupData().createdBy,
                status: Status.ACTIVE
            }).toEqual({ ...getSetSetupData() });
        });

        // Negative test
        it('/set/:id (GET) by wrong id', async () => {
            await request(app.getHttpServer())
                .get(`/set/${getWrongId()}`)
                .expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('Set PATCH', () => {
        it('/set/:id (PATCH) by id by user', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/set/${getSetSetupData()._id}`)
                .send({ language: Language.DE })
                .expect(HttpStatus.OK);

            const set = res.body;
            expect(set.language).toEqual(Language.DE);

            // Testing type ResponseSetMetadata
            expect(set).toEqual(
                expect.objectContaining({
                    _id: expect.any(String),
                    dareCount: expect.any(Number),
                    truthCount: expect.any(Number),
                    createdBy: expect.any(String),
                    language: expect.any(String),
                    name: expect.any(String)
                })
            );
            expect(set).toEqual(
                expect.not.objectContaining({
                    status: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    __v: expect.any(String),
                    tasks: expect.any(Array),
                    previewImage: expect.any(String),
                    bannerImage: expect.any(String)
                })
            );
        });

        it('/set/:id (PATCH) by id by user', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/set/${getSetSetupData()._id}`)
                .send({ name: 'New name' })
                .expect(HttpStatus.OK);
            expect(res.body.language).toEqual(getSetSetupData().language);
            expect(res.body.name).toEqual('New name');

            const set = await setModel.findById(getSetSetupData()._id);
            expect(set.name).toBe('New name');
            expect(set.language).toBe(getSetSetupData().language);
        });

        it('/set/:id (PATCH) by id by admin', async () => {
            fakeAuthGuard.setUser(getMockAuthAdmin());
            const res = await request(app.getHttpServer())
                .patch(`/set/${getSetSetupData()._id}`)
                .send({ language: Language.DE })
                .expect(HttpStatus.OK);
            expect(res.body.language).toEqual(Language.DE);
        });

        // Negative test
        it('/set/:id (PATCH) by id by user with wrong language', async () => {
            await request(app.getHttpServer())
                .patch(`/set/${getSetSetupData()._id}`)
                .send({ language: 'Some string' })
                .expect(HttpStatus.BAD_REQUEST);
        });

        // Negative test
        it('/set/:id (PATCH) by id by user with wrong param', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/set/${getSetSetupData()._id}`)
                .send({ somethingWrong: 'Some string' })
                .expect(HttpStatus.OK);
            expect(res.body.somethingWrong).toBeUndefined();
        });

        // Negative test
        it('/set/:id (PATCH) by id by wrong user', async () => {
            fakeAuthGuard.setUser({
                ...getMockAuthUser(),
                userId: getWrongId()
            });
            await request(app.getHttpServer())
                .patch(`/set/${getSetSetupData()._id}`)
                .send({ language: Language.DE })
                .expect(HttpStatus.NOT_FOUND);
        });

        // Negative test
        it('/set/:id (PATCH) by wrong id', async () => {
            fakeAuthGuard.setUser(getMockAuthAdmin());
            await request(app.getHttpServer())
                .patch(`/set/${getWrongId()}`)
                .send({ language: Language.DE })
                .expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('Set DELETE', () => {
        it('/set/:id (DELETE) by id by user', async () => {
            await request(app.getHttpServer())
                .delete(`/set/${getSetSetupData()._id}`)
                .expect(HttpStatus.NO_CONTENT);
            expect(
                (await setModel.findById(getSetSetupData()._id)).status
            ).toEqual(Status.DELETED);
        });

        it('/set/:id (DELETE) by id by admin', async () => {
            fakeAuthGuard.setUser(getMockAuthAdmin());
            await request(app.getHttpServer())
                .delete(`/set/${getSetSetupData()._id}`)
                .expect(HttpStatus.NO_CONTENT);
            expect(
                (await setModel.findById(getSetSetupData()._id)).status
            ).toEqual(Status.DELETED);
        });

        it('/set/:id (DELETE) by id with hard delete by admin', async () => {
            fakeAuthGuard.setUser(getMockAuthAdmin());
            await request(app.getHttpServer())
                .delete(`/set/${getSetSetupData()._id}?type=hard`)
                .expect(HttpStatus.NO_CONTENT);
            expect((await setModel.find()).length).toBe(0);
        });

        // Negative test
        it('/set/:id (DELETE) by id by wrong user', async () => {
            fakeAuthGuard.setUser({
                ...getMockAuthUser(),
                userId: getWrongId()
            });
            await request(app.getHttpServer())
                .delete(`/set/${getSetSetupData()._id}`)
                .expect(HttpStatus.NOT_FOUND);
        });

        // Negative test
        it('/set/:id (DELETE) by wrong id', async () => {
            await request(app.getHttpServer())
                .delete(`/set/${getWrongId()}`)
                .expect(HttpStatus.NOT_FOUND);
        });

        // Negative test
        it('/set/:id (DELETE) by wrong id with hard delete by admin', async () => {
            fakeAuthGuard.setUser(getMockAuthAdmin());
            await request(app.getHttpServer())
                .delete(`/set/${getWrongId()}?type=hard`)
                .expect(HttpStatus.NOT_FOUND);
        });

        // Negative test
        it('/set/:id (DELETE) by id with hard delete by user', async () => {
            await request(app.getHttpServer())
                .delete(`/set/${getSetSetupData()._id}?type=hard`)
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('Task POST', () => {
        it('/set/:id/task (POST)', async () => {
            const res = await request(app.getHttpServer())
                .post(`/set/${getSetSetupData()._id}/task`)
                .send(getMockTask())
                .expect(HttpStatus.CREATED);
            const set = await setModel.findById(getSetSetupData()._id);
            expect(set.tasks.length).toBe(2);
            expect(set.truthCount).toBe(2);

            // Testing type responseTask
            const task = res.body;
            expect(task).toEqual(
                expect.objectContaining({
                    _id: expect.any(String),
                    type: expect.any(String),
                    message: expect.any(String),
                    currentPlayerGender: expect.any(String)
                })
            );
            expect(task).toEqual(
                expect.not.objectContaining({
                    __v: expect.any(String),
                    status: expect.any(String),
                    createdAt: expect.any(Date),
                    createdBy: expect.any(Date)
                })
            );
        });

        it('/set/:id/task (POST) without CurrentPlayerGender', async () => {
            const { currentPlayerGender, ...obj } = getMockTask();
            const res = await request(app.getHttpServer())
                .post(`/set/${getSetSetupData()._id}/task`)
                .send(obj)
                .expect(HttpStatus.CREATED);
            expect(
                (await setModel.findById(getSetSetupData()._id)).tasks.length
            ).toBe(2);

            // Testing type ResponseTask
            const task = res.body;
            expect(task).toEqual(
                expect.objectContaining({
                    _id: expect.any(String),
                    type: expect.any(String),
                    message: expect.any(String),
                    currentPlayerGender: expect.any(String)
                })
            );
            expect(task).toEqual(
                expect.not.objectContaining({
                    __v: expect.any(String),
                    status: expect.any(String),
                    createdAt: expect.any(Date),
                    createdBy: expect.any(Date)
                })
            );
        });

        it('/set/:id/task (POST) with extra parameter', async () => {
            const res = await request(app.getHttpServer())
                .post(`/set/${getSetSetupData()._id}/task`)
                .send({ ...getMockTask(), more: 'Some more' })
                .expect(HttpStatus.CREATED);
            expect(
                (await setModel.findById(getSetSetupData()._id)).tasks.length
            ).toBe(2);

            // Testing type ResponseTask
            const task = res.body;
            expect(task).toEqual(
                expect.objectContaining({
                    _id: expect.any(String),
                    type: expect.any(String),
                    message: expect.any(String),
                    currentPlayerGender: expect.any(String)
                })
            );
            expect(task).toEqual(
                expect.not.objectContaining({
                    __v: expect.any(String),
                    status: expect.any(String),
                    createdAt: expect.any(Date),
                    createdBy: expect.any(Date),
                    // The extra parameter send
                    more: expect.any(String)
                })
            );
        });

        // Negative test
        it('/set/:id/task (POST) with wrong setId', async () => {
            await request(app.getHttpServer())
                .post(`/set/${getWrongId()}/task`)
                .send(getMockTask())
                .expect(HttpStatus.NOT_FOUND);
        });

        // Negative test
        it('/set/:id/task (POST) with wrong TaskType', async () => {
            await request(app.getHttpServer())
                .post(`/set/${getSetSetupData()._id}/task`)
                .send({ ...getMockTask(), type: 'wrong' })
                .expect(HttpStatus.BAD_REQUEST);
        });

        // Negative test
        it('/set/:id/task (POST) with wrong CurrentPlayerGender', async () => {
            await request(app.getHttpServer())
                .post(`/set/${getSetSetupData()._id}/task`)
                .send({ ...getMockTask(), currentPlayerGender: 'wrong' })
                .expect(HttpStatus.BAD_REQUEST);
        });

        // Negative test
        it('/set/:id/task (POST) with too short message', async () => {
            await request(app.getHttpServer())
                .post(`/set/${getSetSetupData()._id}/task`)
                .send({ ...getMockTask(), message: getString(9) })
                .expect(HttpStatus.BAD_REQUEST);
        });

        // Negative test
        it('/set/:id/task (POST) with too long message', async () => {
            await request(app.getHttpServer())
                .post(`/set/${getSetSetupData()._id}/task`)
                .send({ ...getMockTask(), message: getString(281) })
                .expect(HttpStatus.BAD_REQUEST);
        });

        // Negative test
        it('/set/:id/task (POST) without type', async () => {
            const { type, ...obj } = getMockTask();
            await request(app.getHttpServer())
                .post(`/set/${getSetSetupData()._id}/task`)
                .send(obj)
                .expect(HttpStatus.BAD_REQUEST);
        });

        // Negative test
        it('/set/:id/task (POST) without message', async () => {
            const { message, ...obj } = getMockTask();
            await request(app.getHttpServer())
                .post(`/set/${getSetSetupData()._id}/task`)
                .send(obj)
                .expect(HttpStatus.BAD_REQUEST);
        });
    });

    describe('Task PUT', () => {
        it('/set/:id/task (PUT) changing type for counts check', async () => {
            const res = await request(app.getHttpServer())
                .put(
                    `/set/${getSetSetupData()._id}/task/${
                        getSetSetupData().tasks[0]._id
                    }`
                )
                .send({ ...getMockTask(), type: TaskType.DARE })
                .expect(HttpStatus.OK);

            const set = await setModel.findById(getSetSetupData()._id).lean();
            expect(set.truthCount).toBe(0);
            expect(set.dareCount).toBe(1);

            const message = set.tasks[0].message;
            expect(message).toEqual(getMockTask().message);

            // Testing type UpdatedCounts
            const task = res.body;
            expect(task).toEqual(
                expect.objectContaining({
                    _id: expect.any(String),
                    truthCount: expect.any(Number),
                    dareCount: expect.any(Number)
                })
            );
            // It is unnecessary to tes what is not in the type
        });

        it('/set/:id/task (PUT) with Admin changing type for counts check', async () => {
            fakeAuthGuard.setUser(getMockAuthAdmin());
            const res = await request(app.getHttpServer())
                .put(
                    `/set/${getSetSetupData()._id}/task/${
                        getSetSetupData().tasks[0]._id
                    }`
                )
                .send({ ...getMockTask(), type: TaskType.DARE })
                .expect(HttpStatus.OK);
            const set = await setModel.findById(getSetSetupData()._id).lean();
            expect(set.truthCount).toBe(0);
            expect(set.dareCount).toBe(1);

            const message = set.tasks[0].message;
            expect(message).toEqual(getMockTask().message);

            // Testing type UpdatedCounts
            const task = res.body;
            expect(task).toEqual(
                expect.objectContaining({
                    _id: expect.any(String),
                    truthCount: expect.any(Number),
                    dareCount: expect.any(Number)
                })
            );
            // It is unnecessary to tes what is not in the type
        });

        // Omitting dto tests since they duplicate with task POST tests

        // Negative test
        it('/set/:id/task (PUT) with wrong set id', async () => {
            await request(app.getHttpServer())
                .put(
                    `/set/${getWrongId()}/task/${
                        getSetSetupData().tasks[0]._id
                    }`
                )
                .send(getMockTask())
                .expect(HttpStatus.NOT_FOUND);
        });

        // Negative test
        it('/set/:id/task (PUT) with wrong task id', async () => {
            await request(app.getHttpServer())
                .put(`/set/${getSetSetupData()._id}/task/${getWrongId()}`)
                .send(getMockTask())
                .expect(HttpStatus.NOT_FOUND);
        });

        // Negative test
        it('/set/:id/task (PUT) with wrong user', async () => {
            fakeAuthGuard.setUser('');
            await request(app.getHttpServer())
                .put(
                    `/set/${getSetSetupData()._id}/task/${
                        getSetSetupData().tasks[0]._id
                    }`
                )
                .send(getMockTask())
                .expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('Task DELETE', () => {
        it('/set/:id/task (DELETE) with user', async () => {
            await request(app.getHttpServer())
                .delete(
                    `/set/${getSetSetupData()._id}/task/${
                        getSetSetupData().tasks[0]._id
                    }`
                )
                .expect(HttpStatus.NO_CONTENT);
            const set = await setModel.findById(getSetSetupData()._id);
            expect(set.tasks[0].status).toBe(Status.DELETED);
            expect(set.truthCount).toBe(0);
            expect(set.dareCount).toBe(0);
        });

        it('/set/:id/task (DELETE) with admin', async () => {
            fakeAuthGuard.setUser(getMockAuthAdmin());
            await request(app.getHttpServer())
                .delete(
                    `/set/${getSetSetupData()._id}/task/${
                        getSetSetupData().tasks[0]._id
                    }`
                )
                .expect(HttpStatus.NO_CONTENT);
            const set = await setModel.findById(getSetSetupData()._id);
            expect(set.tasks[0].status).toBe(Status.DELETED);
            expect(set.truthCount).toBe(0);
            expect(set.dareCount).toBe(0);
        });

        it('/set/:id/task (DELETE) hard with admin', async () => {
            fakeAuthGuard.setUser(getMockAuthAdmin());
            await request(app.getHttpServer())
                .delete(
                    `/set/${getSetSetupData()._id}/task/${
                        getSetSetupData().tasks[0]._id
                    }?type=hard`
                )
                .expect(HttpStatus.NO_CONTENT);
            const set = await setModel.findById(getSetSetupData()._id);
            expect(set.tasks.length).toBe(0);
            expect(set.truthCount).toBe(0);
            expect(set.dareCount).toBe(0);
        });

        // Negative test
        it('/set/:id/task (DELETE) hard with user', async () => {
            await request(app.getHttpServer())
                .delete(
                    `/set/${getSetSetupData()._id}/task/${
                        getSetSetupData().tasks[0]._id
                    }?type=hard`
                )
                .expect(HttpStatus.FORBIDDEN);
        });

        // Negative test
        it('/set/:id/task (DELETE) hard, with admin with wrong setId', async () => {
            fakeAuthGuard.setUser(getMockAuthAdmin());
            await request(app.getHttpServer())
                .delete(
                    `/set/${getWrongId()}/task/${
                        getSetSetupData().tasks[0]._id
                    }?type=hard`
                )
                .expect(HttpStatus.NOT_FOUND);
        });

        // Negative test
        it('/set/:id/task (DELETE) hard, with admin with wrong taskId', async () => {
            fakeAuthGuard.setUser(getMockAuthAdmin());
            await request(app.getHttpServer())
                .delete(
                    `/set/${
                        getSetSetupData()._id
                    }/task/${getWrongId()}?type=hard`
                )
                .expect(HttpStatus.NOT_FOUND);
            const set = await setModel.findById(getSetSetupData()._id);
            expect(set.tasks.length).toBe(1);
        });

        // Negative task
        it('/set/:id/task (DELETE) with wrong set id', async () => {
            await request(app.getHttpServer())
                .delete(
                    `/set/${getWrongId()}/task/${
                        getSetSetupData().tasks[0]._id
                    }`
                )
                .expect(HttpStatus.NOT_FOUND);
        });

        // Negative task
        it('/set/:id/task (DELETE) with wrong task id', async () => {
            await request(app.getHttpServer())
                .delete(`/set/${getSetSetupData()._id}/task/${getWrongId()}`)
                .expect(HttpStatus.NOT_FOUND);
        });

        // Negative task
        it('/set/:id/task (DELETE) with wrong user', async () => {
            fakeAuthGuard.setUser('');
            await request(app.getHttpServer())
                .delete(
                    `/set/${getSetSetupData()._id}/task/${
                        getSetSetupData().tasks[0]._id
                    }`
                )
                .expect(HttpStatus.NOT_FOUND);
        });
    });
});
