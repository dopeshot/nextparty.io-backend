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
    UseGuards,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ObjectId } from 'mongoose'
import { JwtUserDto } from 'src/auth/dto/jwt.dto'
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard'
import { MongoIdDto } from '../shared/dto/mongoId.dto'
import { CreateSetDto } from './dto/create-set.dto'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateSetDto } from './dto/update-set.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { SetService } from './set.service'

@ApiTags('set')
@Controller('set')
export class SetController {
    constructor(private readonly setService: SetService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create new set' })
    createSet(@Body() createSetDto: CreateSetDto, @Request() req) {
        return this.setService.createSet(createSetDto, req.user)
    }

    @Get()
    @ApiOperation({ summary: 'Get all Sets' })
    getAllSets() {
        return this.setService.getAllSets()
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get one Set by id' })
    getOneSet(@Param() { id }: MongoIdDto) {
        return this.setService.getOneSet(id)
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update Set by id' })
    updateMeta(
        @Param() { id }: MongoIdDto,
        @Body() updateSetDto: UpdateSetDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto },
    ) {
        return this.setService.updateSetMetadata(id, updateSetDto, user)
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    // TODO MC: Can not reprocude error
    @HttpCode(204)
    @ApiOperation({ summary: 'Delete Set by id' })
    deleteSet(
        @Param() { id }: MongoIdDto,
        @Query('type') type: string,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto },
    ) {
        return this.setService.deleteSet(id, type, user)
    }

    // Tasks

    @Post(':id/task')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create Task to Set via id and Json' })
    createTask(
        @Param() { id }: MongoIdDto,
        @Body() createTaskDto: CreateTaskDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto },
    ) {
        return this.setService.createTask(id, createTaskDto, user)
    }

    @Put(':id/task/:taskid')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update one Task via id and Json' })
    updateTask(
        @Param('id') setId: ObjectId,
        @Param('taskid') taskId: ObjectId,
        @Body() updateTaskDto: UpdateTaskDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto },
    ) {
        return this.setService.updateTask(setId, taskId, updateTaskDto, user)
    }

    @Delete(':id/task/:taskid')
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    @ApiOperation({ summary: 'Remove one Task via id' })
    removeTask(
        @Param('id') setId: ObjectId,
        @Param('taskid') taskId: ObjectId,
        @Query('type') type: string,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto },
    ) {
        return this.setService.removeTask(setId, taskId, type, user)
    }
    /* istanbul ignore next */ // This is development only
    @Post('migrate')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create example data sets' })
    public createExampelData(@Request() req, @Query('test') test: string) {
        return this.setService.createExampleSets(req.user, test)
    }
}
