import { Test, TestingModule } from '@nestjs/testing';
import { MigrationController } from './migration.controller';
import { MigrationService } from './migration.service';

describe('MigrationController', () => {
    let controller: MigrationController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MigrationController],
            providers: [MigrationService]
        }).compile();

        controller = module.get<MigrationController>(MigrationController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
