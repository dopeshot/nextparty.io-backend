import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, Query, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { IdTaskDto } from 'src/task/dto/id-task.dto';
import { PaginationDto } from 'src/task/dto/paginationDto.dto';
import { CategoryService } from './category.service';
import { addSetIdCategoryDto } from './dto/addSet-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id/toptensets')
  findTopTenSets(@Param(ValidationPipe) { id }: IdTaskDto) {
    return this.categoryService.findTopTenSets(id);
  }
  @Get(':id/allsets')
  findAllSets(@Param('id') id:  ObjectId,  @Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto) {
    return this.categoryService.findAllSets(id, +paginationDto.page,+paginationDto.limit);
  }

  @Get(':id')
  findOne(@Param(ValidationPipe) { id }: IdTaskDto) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id/:id2')
  updateSets(@Param(ValidationPipe) addSetId: addSetIdCategoryDto, @Query('option') option: string) {
    return this.categoryService.updateSets(addSetId.id, addSetId.id2, option);
  }

  @Patch(':id')
  update(@Param(ValidationPipe) { id }: IdTaskDto, @Body(new ValidationPipe({ whitelist: true })) updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.updateMetadata(id, updateCategoryDto);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param(ValidationPipe) { id }: IdTaskDto) {
    return this.categoryService.remove(id);
  }
}
