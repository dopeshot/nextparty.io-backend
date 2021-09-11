import { Body, Controller, Delete, Get, HttpCode, InternalServerErrorException, NotFoundException, Param, Patch, Post, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { JwtUserDto } from 'src/auth/dto/jwt.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { MongoIdDto } from '../shared/dto/mongoId.dto';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { TaskVoteDto } from '../task/dto/task-vote-dto';
import { CreateSetDto } from './dto/create-set.dto';
import { UpdateSetDto } from './dto/update-set-metadata.dto';
import { UpdateSetTasksDto } from './dto/update-set-tasks.dto';
import { SetService } from './set.service';

@ApiTags('set')
@Controller('set')
export class SetController {
  constructor(private readonly setService: SetService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create new set'})
  create(@Body(new ValidationPipe({ whitelist: true })) createSetDto: CreateSetDto, @Request() req) {
    return this.setService.create(createSetDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Sets'})
  findAll(@Query(new ValidationPipe({ whitelist: true })) paginationDto: PaginationDto) {
    return this.setService.findAll(+paginationDto.page, +paginationDto.limit);
  }

  @Get('test')
  @HttpCode(201)
  example(@Query('error') error: string) {
    try {
      if(error === 'yes')
      throw new NotFoundException()
    } catch(error) {
      throw new InternalServerErrorException()
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one Set by id'})
  findOne(@Param(new ValidationPipe({ whitelist: true })) { id }: MongoIdDto) {
    return this.setService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  // TODO MC: Can not reprocude error
  @HttpCode(201)
  @ApiOperation({ summary: 'Delete Set via id'})
  remove(@Param(new ValidationPipe({ whitelist: true })) { id }: MongoIdDto, @Query('type') type: string, @Request() { user }: ParameterDecorator & { user: JwtUserDto }) {
    return this.setService.remove(id, type, user)
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Get all tasks in set with paging Maxi-Version'})
  getSetTasks(@Param(new ValidationPipe({ whitelist: true })) { id }:  MongoIdDto,  @Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto) {
    return this.setService.getTasks2(id, +paginationDto.page,+paginationDto.limit);
  }

  @Get(':id/tasks1')
  @ApiOperation({ summary: 'Get all tasks in set with paging Max-Version'})
  getSetTasks1(@Param(new ValidationPipe({ whitelist: true })) { id }:  MongoIdDto,  @Query('page') page: number) {
    return this.setService.getTasks(id, page);
  }

  @Get(':id/tentasks')
  @ApiOperation({ summary: 'Get top 10 tasks in set sorted by difference'})
  getSetTopTenTasks(@Param(new ValidationPipe({ whitelist: true })) { id }:  MongoIdDto) {
    return this.setService.findTopTenTasks(id);
  }

  @Get(':id/meta')
  @ApiOperation({ summary: 'Get set metadata'})
  getMeta(@Param(new ValidationPipe({ whitelist: true })) { id }:  MongoIdDto, @Body() updateSetDto: UpdateSetDto) {
    return this.setService.getMetadata(id);
  }

  @Patch(':id/meta')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update Set metadata'}) 
  updateMeta(@Param('id') id: ObjectId, @Body() updateSetDto: UpdateSetDto, @Request() { user }: ParameterDecorator & { user: JwtUserDto }) {
    return this.setService.updateMetadata(id, updateSetDto, user);
  }

  @Patch(':id/:vote')
  @ApiOperation({ summary: 'Vote one Set by id'})
  vote(@Param(ValidationPipe) setVoteDto: TaskVoteDto,) {
    return this.setService.vote(setVoteDto.id, setVoteDto.vote);
  }

  @Post(':id/add')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add Task to Set via id and Json'})
  addTask(@Param('id') id: ObjectId, @Body() updateSetTasksDto: UpdateSetTasksDto, @Request() { user }: ParameterDecorator & { user: JwtUserDto }) {
    return this.setService.alterTasks(id, "add", updateSetTasksDto, user);
  }
  
  @Post(':id/remove')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove one Set via id and Json'})
  removeTask(@Param('id') id:  ObjectId, @Body() updateSetTasksDto: UpdateSetTasksDto, @Request() { user }: ParameterDecorator & { user: JwtUserDto }) {
    return this.setService.alterTasks(id, "remove", updateSetTasksDto, user);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get sets from user'})
  userSets(@Param(new ValidationPipe({whitelist:true})){id}: MongoIdDto,  @Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto){
    return this.setService.userSets(id, +paginationDto.page,+paginationDto.limit);
  }

  @Get('healthcheck')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'HealthCheck for sets'})
  healthCheck(@Request() { user }: ParameterDecorator & { user: JwtUserDto }){
    return this.setService.healthCheck(user);
  }
}
