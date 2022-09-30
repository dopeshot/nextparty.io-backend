import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { JwtAuthGuard } from '../src/auth/strategies/jwt/jwt-auth.guard';
import { OptionalJWTGuard } from '../src/auth/strategies/optionalJWT/optionalJWT.guard';
import { MigrationModule } from '../src/migration/migration.module';
import { SetDocument } from '../src/set/entities/set.entity';
import { UserDocument } from '../src/user/entities/user.entity';
import { FakeAuthGuardFactory } from './helpers/fake-auth-guard.factory';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/mongo-memory-helpers';
import { migrationSetup } from './__mocks__/migration-mock-data';
import { getMockAuthAdmin, getMockAuthUser } from './__mocks__/set-mock-data';
describe('Sets (e2e)', () => {
    let app: INestApplication;
    let setModel: Model<SetDocument>;
    let userModel: Model<UserDocument>;
    const fakeAuthGuard = new FakeAuthGuardFactory();
    let connection: Connection;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                MigrationModule,
                ConfigModule.forRoot({
                    envFilePath: ['.env', '.development.env']
                })
            ]
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(fakeAuthGuard.getGuard())
            .overrideGuard(OptionalJWTGuard)
            .useValue(fakeAuthGuard.getGuard())
            .compile();

        connection = await module.get(getConnectionToken());
        setModel = connection.model<SetDocument>('Set');
        userModel = connection.model<UserDocument>('User');
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    beforeEach(async () => {
        await userModel.insertMany(migrationSetup.users);
        fakeAuthGuard.setActive(true);
        fakeAuthGuard.setUser(getMockAuthAdmin());
    });

    afterEach(async () => {
        await setModel.deleteMany();
        await userModel.deleteMany();
        fakeAuthGuard.setUser(null);
    });

    afterAll(async () => {
        await connection.close();
        closeInMongodConnection();
    });

    describe('Migration POST', () => {
        it('/migrations/import (POST) with admin and empty database', async () => {
            const res = await request(app.getHttpServer())
                .post('/migrations/import')
                .send(migrationSetup)
                .expect(HttpStatus.CREATED);
            expect(res.body).toEqual({ setDuplicates: 0, userDuplicates: 1 });
        });

        it('/migrations/import (POST) with admin and filled sets', async () => {
            setModel.insertMany(migrationSetup.sets);
            const res = await request(app.getHttpServer())
                .post('/migrations/import')
                .send(migrationSetup)
                .expect(HttpStatus.CREATED);
            expect(res.body).toEqual({
                setDuplicates: 1,
                userDuplicates: 1
            });
        });

        // Negative test
        it('/migrations/import (POST) with user', async () => {
            fakeAuthGuard.setUser(getMockAuthUser());
            await request(app.getHttpServer())
                .post('/migrations/import')
                .send(migrationSetup)
                .expect(HttpStatus.FORBIDDEN);
        });

        // Negative test
        it('/migrations/import (POST) with wrong dto', async () => {
            await request(app.getHttpServer())
                .post('/migrations/import')
                .send({})
                .expect(HttpStatus.BAD_REQUEST);
        });
    });

    describe('Migration POST', () => {
        it('/migrations/export (GET) with admin', async () => {
            setModel.insertMany(migrationSetup.sets);
            const res = await request(app.getHttpServer())
                .get('/migrations/export')
                .expect(HttpStatus.OK);
            expect(res.body).toEqual(migrationSetup);
        });

        // Negative test
        it('/migrations/export (GET) without admin', async () => {
            fakeAuthGuard.setUser(getMockAuthUser());
            await request(app.getHttpServer())
                .get('/migrations/export')
                .expect(HttpStatus.FORBIDDEN);
        });
    });
});
