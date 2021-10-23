import { Body, Controller, Get, Param, ParseArrayPipe, ValidationPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

  @Get(':searchstring')
  @ApiOperation({ summary: 'Searching for the send input in everything' })
  search(
    @Param('searchstring') searchString: string,
    @Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto) {
    return this.searchService.search(searchString, +paginationDto.page, +paginationDto.limit)
  }

  @Get(':searchstring/:type')
  @ApiOperation({ summary: 'Searching for the send input in certain type' })
  searchType(
    @Param('searchstring') searchString: string,
    @Param('type') type: string,
    @Query(new ValidationPipe({ transform: true })) paginationDto: PaginationDto) {
    return this.searchService.search(searchString, +paginationDto.page, +paginationDto.limit, type)
  }
}
