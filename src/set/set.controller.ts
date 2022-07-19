import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Request,
    SerializeOptions,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtUserDto } from 'src/auth/dto/jwt.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { OptionalJWTGuard } from '../auth/strategies/optionalJWT/optionalJWT.guard';
import { LanguageDto } from '../shared/dto/lanugage.dto';
import { MongoIdDto } from '../shared/dto/mongoId.dto';
import { CreateFullSetDto } from './dto/create-full-set.dto';
import { CreateSetDto } from './dto/create-set.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { DeleteTypeDto } from './dto/delete-type.dto';
import { SetTaskMongoIdDto } from './dto/set-task-mongoid.dto';
import { UpdateSetDto } from './dto/update-set.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
    SetMetadataResponse,
    SetResponse,
    SetWithTasksResponse,
    TaskResponse,
    UpdatedCounts,
    UpdatedPlayed
} from './responses/set-response';
import { SetService } from './set.service';

@ApiTags('sets')
@Controller('sets')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export class SetController {
    constructor(private readonly setService: SetService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create new set | Uses JwtAuthGuard' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: SetResponse,
        description: 'Set created'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        type: UpdatedCounts,
        description: 'Jwt not valid'
    })
    async createSet(
        @Body() createSetDto: CreateSetDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ): Promise<SetResponse> {
        return new SetResponse(
            await this.setService.createSet(createSetDto, user)
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get all Sets | Uses no Guard' })
    @ApiResponse({
        status: HttpStatus.OK,
        type: [SetResponse],
        description: 'Got all sets'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        type: null,
        description: 'the requested language does not exist'
    })
    async getAllSets(@Query() { lang }: LanguageDto): Promise<SetResponse[]> {
        return (await this.setService.getAllSets(lang)).map(
            (set) => new SetResponse(set)
        );
    }

    @Get('/user/:id')
    @UseGuards(OptionalJWTGuard)
    @ApiOperation({
        summary: 'Get one Set by author id | Uses OptionalJwtGuard'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: [SetResponse],
        description: 'Got all sets from one player'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        type: null,
        description: "request doesn't match dto"
    })
    async getSetsFromUser(
        @Param() { id }: MongoIdDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ): Promise<SetResponse[]> {
        return (await this.setService.getSetsFromUser(id, user)).map(
            (set) => new SetResponse(set)
        );
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get one Set with tasks by id | Uses OptionalJwtGuard'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: [SetWithTasksResponse],
        description: 'Got one set with tasks'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: null,
        description: 'Set could not be found, maybe permissions are missing'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        type: null,
        description: "request doesn't match dto"
    })
    @UseGuards(OptionalJWTGuard)
    async getOneSet(
        @Param() { id }: MongoIdDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ): Promise<SetWithTasksResponse> {
        return new SetWithTasksResponse(
            await this.setService.getOneSet(id, user)
        );
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update Set by id | Uses JwtAuthGuard' })
    @ApiResponse({
        status: HttpStatus.OK,
        type: [SetMetadataResponse],
        description: 'Set has been updated'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        type: null,
        description: "request doesn't match dto"
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        type: UpdatedCounts,
        description: 'Jwt not valid'
    })
    async updateMeta(
        @Param() { id }: MongoIdDto,
        @Body() updateSetDto: UpdateSetDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ): Promise<SetMetadataResponse> {
        return new SetMetadataResponse(
            await this.setService.updateSetMetadata(id, updateSetDto, user)
        );
    }

    @Patch(':id/played')
    @ApiOperation({
        summary: 'Increment set played amount by id | Uses no Guard'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: UpdatedPlayed,
        description: 'Set has been updated'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: null,
        description: 'Set could not be found'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        type: null,
        description: 'id is not viable'
    })
    async updatePlayed(@Param() { id }: MongoIdDto): Promise<UpdatedPlayed> {
        return new UpdatedPlayed(await this.setService.updateSetPlayed(id));
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete Set by id | Uses JwtAuthGuard' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        type: null,
        description: "Set has been deleted or didn't exist"
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        type: UpdatedCounts,
        description: 'Jwt not valid'
    })
    async deleteSet(
        @Param() { id }: MongoIdDto,
        @Query() { type }: DeleteTypeDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ) {
        return await this.setService.deleteSet(id, type, user);
    }

    // Tasks

    @Post(':id/task')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Create Task to Set via id and Json | Uses JwtAuthGuard'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: TaskResponse,
        description: 'Task has been added to set'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: null,
        description: 'Set could not be found'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        type: null,
        description: 'id or dto is not viable'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        type: UpdatedCounts,
        description: 'Jwt not valid'
    })
    async createTask(
        @Param() { id }: MongoIdDto,
        @Body() createTaskDto: CreateTaskDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ): Promise<TaskResponse> {
        return new TaskResponse(
            await this.setService.createTask(id, createTaskDto, user)
        );
    }

    @Put(':setId/task/:taskId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Update one Task via id and Json | Uses JwtAuthGuard'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: UpdatedCounts,
        description: 'Task and counts have been updated'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        type: UpdatedCounts,
        description: 'Jwt not valid'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: null,
        description: 'Set could not be found'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        type: null,
        description: 'ids or dto is not viable'
    })
    async updateTask(
        @Param() { setId, taskId }: SetTaskMongoIdDto,
        @Body() updateTaskDto: UpdateTaskDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ): Promise<UpdatedCounts> {
        return new UpdatedCounts(
            await this.setService.updateTask(setId, taskId, updateTaskDto, user)
        );
    }

    @Delete(':setId/task/:taskId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove one Task via id | Uses JwtAuthGuard' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        type: null,
        description: "Task has been deleted or didn't exist"
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        type: UpdatedCounts,
        description: 'Jwt not valid'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        type: null,
        description: 'ids or dto is not viable'
    })
    async removeTask(
        @Param() { setId, taskId }: SetTaskMongoIdDto,
        @Query() { type }: DeleteTypeDto,
        @Request() { user }: ParameterDecorator & { user: JwtUserDto }
    ) {
        return await this.setService.removeTask(setId, taskId, type, user);
    }

    @Post('createfullset')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create example data sets | Uses JwtAuthGuard' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: null,
        description: "Task has been deleted or didn't exist"
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        type: UpdatedCounts,
        description: 'Jwt not valid'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        type: null,
        description: 'dto is not viable'
    })
    async createDataFromFullSet(
        @Request() { user }: ParameterDecorator & { user: JwtUserDto },
        @Body() fullSet: CreateFullSetDto
    ): Promise<SetWithTasksResponse> {
        return new SetWithTasksResponse(
            await this.setService.createDataFromFullSet(user, fullSet)
        );
    }
}
