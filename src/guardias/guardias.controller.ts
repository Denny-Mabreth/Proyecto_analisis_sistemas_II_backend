import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GuardiasService } from './guardias.service.js';
import { CreateGuardiaDto } from './dto/create-guardia.dto.js';
import { UpdateGuardiaDto } from './dto/update-guardia.dto.js';

@Controller('guardias')
export class GuardiasController {
  constructor(private readonly guardiasService: GuardiasService) {}

  @Post()
  create(@Body() createGuardiaDto: CreateGuardiaDto) {
    return this.guardiasService.create(createGuardiaDto);
  }

  @Get()
  findAll() {
    return this.guardiasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guardiasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGuardiaDto: UpdateGuardiaDto) {
    return this.guardiasService.update(+id, updateGuardiaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guardiasService.remove(+id);
  }
}
