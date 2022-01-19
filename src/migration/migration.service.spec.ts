import { Test, TestingModule } from '@nestjs/testing';
import { MigrationService } from './migration.service';

describe('MigrationService', () => {
    let service: MigrationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MigrationService]
        }).compile();

        service = module.get<MigrationService>(MigrationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
