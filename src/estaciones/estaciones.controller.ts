import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstacionesService } from './estaciones.service.js';
import { CreateEstacionDto } from './dto/create-estacion.dto.js';
import { UpdateEstacionDto } from './dto/update-estacion.dto.js';

@Controller('estaciones')
export class EstacionesController {
  constructor(private readonly estacionesService: EstacionesService) {}

  @Post()
  create(@Body() createEstacionDto: CreateEstacionDto) {
    return this.estacionesService.create(createEstacionDto);
  }

  @Get()
  findAll() {
    return this.estacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estacionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstacionDto: UpdateEstacionDto) {
    return this.estacionesService.update(+id, updateEstacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estacionesService.remove(+id);
  }
}
