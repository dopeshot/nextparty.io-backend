import { Body, Controller, Get, Param, ParseArrayPipe, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Query } from 'mongoose';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get(':searchstring')
  @ApiOperation({summary: 'Searching for the send input in everything'})
  search(@Param('searchstring') searchString: string){
    return this.searchService.search(searchString)
  }
}
