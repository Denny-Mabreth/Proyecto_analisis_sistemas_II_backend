import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MunicipalidadesService } from './municipalidades.service.js';
import { CreateMunicipalidadDto } from './dto/create-municipalidad.dto.js';
import { UpdateMunicipalidadDto } from './dto/update-municipalidad.dto.js';

@Controller('municipalidades')
export class MunicipalidadesController {
  constructor(private readonly municipalidadesService: MunicipalidadesService) {}

  @Post()
  create(@Body() createMunicipalidadDto: CreateMunicipalidadDto) {
    return this.municipalidadesService.create(createMunicipalidadDto);
  }

  @Get()
  findAll() {
    return this.municipalidadesService.findAll();
  }

  @Get('status')
  checkStatus() {
    return {
      success: true,
      message: '¡Conexión exitosa! El backend de Transmetro está en línea.',
      timestamp: new Date().toISOString()
    };
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.municipalidadesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMunicipalidadDto: UpdateMunicipalidadDto) {
    return this.municipalidadesService.update(+id, updateMunicipalidadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.municipalidadesService.remove(+id);
  }
}
