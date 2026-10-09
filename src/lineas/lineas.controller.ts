import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LineasService } from './lineas.service.js';
import { CreateLineaDto } from './dto/create-linea.dto.js';
import { AddEstacionDto } from './dto/add-estacion.dto.js';
import { UpdateLineaDto } from './dto/update-linea.dto.js';

@Controller('lineas')
export class LineasController {
  constructor(private readonly lineasService: LineasService) {}

  @Post()
  create(@Body() createLineaDto: CreateLineaDto) {
    return this.lineasService.create(createLineaDto);
  }

  @Get()
  findAll() {
    return this.lineasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lineasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLineaDto: UpdateLineaDto) {
    return this.lineasService.update(+id, updateLineaDto);
  }

  @Post(':id/estaciones')
  addEstacion(@Param('id') id: string, @Body() addEstacionDto: AddEstacionDto) {
    return this.lineasService.addEstacion(+id, addEstacionDto);
  }

  @Delete(':id/estaciones/:estacionId')
  removeEstacion(@Param('id') id: string, @Param('estacionId') estacionId: string) {
    return this.lineasService.removeEstacion(+id, +estacionId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lineasService.remove(+id);
  }
}
