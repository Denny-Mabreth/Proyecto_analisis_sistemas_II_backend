import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParqueosService } from './parqueos.service.js';
import { CreateParqueoDto } from './dto/create-parqueo.dto.js';
import { UpdateParqueoDto } from './dto/update-parqueo.dto.js';

@Controller('parqueos')
export class ParqueosController {
  constructor(private readonly parqueosService: ParqueosService) {}

  @Post()
  create(@Body() createParqueoDto: CreateParqueoDto) {
    return this.parqueosService.create(createParqueoDto);
  }

  @Get()
  findAll() {
    return this.parqueosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parqueosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParqueoDto: UpdateParqueoDto) {
    return this.parqueosService.update(+id, updateParqueoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parqueosService.remove(+id);
  }
}
