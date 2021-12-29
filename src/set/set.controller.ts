import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Request,
    UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtUserDto } from 'src/auth/dto/jwt.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { MongoIdDto } from '../shared/dto/mongoId.dto';
import { CreateSetDto } from './dto/create-set.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { DeleteTypeDto } from './dto/delete-type.dto';
import { SetTaskMongoIdDto } from './dto/set-task-mongoid.dto';
import { UpdateSetDto } from './dto/update-set.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SetService } from './set.service';

@ApiTags('set')
@Controller('set')
export class SetController {
    constructor(private readonly setService: SetService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create new set' })
    createSet(
        @Body() createSetDto: CreateSetDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ) {
        return this.setService.createSet(createSetDto, user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all Sets' })
    getAllSets() {
        return this.setService.getAllSets();
    }

    @Get('/user/:id?')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get one Set by author id' })
    getSetsFromUser(
        @Param() { id }: MongoIdDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ) {
        return this.setService.getSetsFromUser(user, id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get one Set by id' })
    getOneSet(@Param() { id }: MongoIdDto) {
        return this.setService.getOneSet(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update Set by id' })
    updateMeta(
        @Param() { id }: MongoIdDto,
        @Body() updateSetDto: UpdateSetDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ) {
        return this.setService.updateSetMetadata(id, updateSetDto, user);
    }

    @Patch(':id/played')
    @ApiOperation({ summary: 'Update Set by id' })
    updatePlayed(@Param() { id }: MongoIdDto) {
        return this.setService.updateSetPlayed(id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    @ApiOperation({ summary: 'Delete Set by id' })
    deleteSet(
        @Param() { id }: MongoIdDto,
        @Query() { type }: DeleteTypeDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ) {
        return this.setService.deleteSet(id, type, user);
    }

    // Tasks

    @Post(':id/task')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create Task to Set via id and Json' })
    createTask(
        @Param() { id }: MongoIdDto,
        @Body() createTaskDto: CreateTaskDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ) {
        return this.setService.createTask(id, createTaskDto, user);
    }

    @Put(':setId/task/:taskId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update one Task via id and Json' })
    updateTask(
        @Param() { setId, taskId }: SetTaskMongoIdDto,
        @Body() updateTaskDto: UpdateTaskDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ) {
        return this.setService.updateTask(setId, taskId, updateTaskDto, user);
    }

    @Delete(':setId/task/:taskId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    @ApiOperation({ summary: 'Remove one Task via id' })
    removeTask(
        @Param() { setId, taskId }: SetTaskMongoIdDto,
        @Query() { type }: DeleteTypeDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ) {
        return this.setService.removeTask(setId, taskId, type, user);
    }
    /* istanbul ignore next */ // This is development only
    @Post('migrate')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create example data sets' })
    public createExampelData(
        @Request() { user }: ParameterDecorator & { user: JwtUserDto },
        @Query('test') test: string
    ) {
        return this.setService.createExampleSets(user, test);
    }
}
