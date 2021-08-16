import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, Query, HttpCode, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/roles/roles.decorator'
import { RolesGuard } from '../auth/roles/roles.guard'
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard'
import { Role } from '../user/enums/role.enum'
import { MongoIdDto } from '../shared/dto/mongoId.dto'
import { PaginationDto } from '../shared/dto/pagination.dto'
import { CategoryService } from './category.service'
import { addSetIdCategoryDto } from './dto/addSet-category.dto'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create a category'})
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all categories'})
  findAll(@Query(new ValidationPipe({ transform: true})) paginationDto: PaginationDto ) {
    return this.categoryService.findAll(+paginationDto.page, +paginationDto.limit);
  }

  @Get(':id/toptensets')
  findTopTenSets(@Param(ValidationPipe) { id }: MongoIdDto) {
    return this.categoryService.findTopTenSets(id);
  }

  @Get(':id/sets')
  // TODO: Doens't work
  findAllSets(@Param(ValidationPipe) { id }: MongoIdDto,  @Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto) {
    return this.categoryService.findAllSets(id, +paginationDto.page, +paginationDto.limit);
  }

  @Get(':id')
  // TODO: Populate missing
  findOne(@Param(ValidationPipe) { id }: MongoIdDto) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id/:action/:setId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Add or remove set from a category'})
  updateSets(@Param(ValidationPipe) addSetId: addSetIdCategoryDto, @Param('action') action: string) {
    return this.categoryService.updateSets(addSetId.id, addSetId.setId, action);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update basic information of a category'})
  update(@Param(ValidationPipe) { id }: MongoIdDto, @Body(new ValidationPipe({ whitelist: true })) updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.updateMetadata(id, updateCategoryDto);
  }

  @HttpCode(204)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete a category'})
  remove(@Param(ValidationPipe) { id }: MongoIdDto, @Query('type') type: string) {
    return this.categoryService.remove(id, type);
  }
}
