import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SetService } from './set.service';
import { CreateSetDto } from './dto/create-set.dto';
import { UpdateSetDto } from './dto/update-set.dto';

@Controller('set')
export class SetController {
  constructor(private readonly setService: SetService) {}

  @Post()
  create(@Body() createSetDto: CreateSetDto) {
    return this.setService.create(createSetDto);
  }

  @Get()
  findAll() {
    return this.setService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSetDto: UpdateSetDto) {
    return this.setService.update(+id, updateSetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.setService.remove(+id);
  }
}
