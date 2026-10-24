import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Municipalidad } from './entities/municipalidad.entity.js';
import { CreateMunicipalidadDto } from './dto/create-municipalidad.dto.js';
import { UpdateMunicipalidadDto } from './dto/update-municipalidad.dto.js';

@Injectable()
export class MunicipalidadesService {
  constructor(
    @InjectRepository(Municipalidad)
    private municipalidadRepository: Repository<Municipalidad>,
  ) {}

  create(createMunicipalidadDto: CreateMunicipalidadDto) {
    const nuevaMunicipalidad = this.municipalidadRepository.create(createMunicipalidadDto);
    return this.municipalidadRepository.save(nuevaMunicipalidad);
  }

  findAll() {
    return this.municipalidadRepository.find();
  }

  async findOne(id: number) {
    const municipalidad = await this.municipalidadRepository.findOneBy({ id });
    if (!municipalidad) {
      throw new NotFoundException(`Municipalidad con ID ${id} no encontrada`);
    }
    return municipalidad;
  }

  async update(id: number, updateMunicipalidadDto: UpdateMunicipalidadDto) {
    const municipalidad = await this.findOne(id);
    Object.assign(municipalidad, updateMunicipalidadDto);
    return this.municipalidadRepository.save(municipalidad);
  }

  async remove(id: number) {
    const municipalidad = await this.findOne(id);
    try {
      return await this.municipalidadRepository.remove(municipalidad);
    } catch (error: any) {
      if (error.code === '23503') {
        throw new BadRequestException('No se puede eliminar la municipalidad porque tiene líneas o estaciones asignadas.');
      }
      throw error;
    }
  }
}
