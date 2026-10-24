import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estacion } from './entities/estacion.entity.js';
import { CreateEstacionDto } from './dto/create-estacion.dto.js';
import { UpdateEstacionDto } from './dto/update-estacion.dto.js';
import { Municipalidad } from '../municipalidades/entities/municipalidad.entity.js';

@Injectable()
export class EstacionesService {
  constructor(
    @InjectRepository(Estacion)
    private estacionesRepository: Repository<Estacion>,
    @InjectRepository(Municipalidad)
    private municipalidadRepository: Repository<Municipalidad>,
  ) {}

  async create(createEstacionDto: CreateEstacionDto): Promise<Estacion> {
    const municipalidad = await this.municipalidadRepository.findOneBy({ id: createEstacionDto.municipalidadId });
    if (!municipalidad) {
      throw new NotFoundException(`Municipalidad con ID ${createEstacionDto.municipalidadId} no encontrada`);
    }

    const nuevaEstacion = this.estacionesRepository.create({
      ...createEstacionDto,
      municipalidad,
    });
    return this.estacionesRepository.save(nuevaEstacion);
  }

  findAll(): Promise<Estacion[]> {
    return this.estacionesRepository.find({
      relations: {
        municipalidad: true,
        parqueos: true,
      },
    });
  }

  async findOne(id: number): Promise<Estacion> {
    const estacion = await this.estacionesRepository.findOne({
      where: { id },
      relations: {
        municipalidad: true,
        lineasEstaciones: true,
        accesos: true,
        parqueos: true,
      },
    });
    if (!estacion) {
      throw new NotFoundException(`Estación con ID ${id} no encontrada`);
    }
    return estacion;
  }

  async update(id: number, updateEstacionDto: UpdateEstacionDto): Promise<Estacion> {
    const estacion = await this.findOne(id);

    if (updateEstacionDto.municipalidadId) {
      const municipalidad = await this.municipalidadRepository.findOneBy({ id: updateEstacionDto.municipalidadId });
      if (!municipalidad) {
        throw new NotFoundException(`Municipalidad con ID ${updateEstacionDto.municipalidadId} no encontrada`);
      }
      estacion.municipalidad = municipalidad;
    }

    if (updateEstacionDto.nombre !== undefined) estacion.nombre = updateEstacionDto.nombre;

    return this.estacionesRepository.save(estacion);
  }

  async remove(id: number): Promise<void> {
    const estacion = await this.findOne(id);
    try {
      await this.estacionesRepository.remove(estacion);
    } catch (error: any) {
      if (error.code === '23503') {
        throw new BadRequestException('No se puede eliminar la estación porque tiene parqueos, líneas o accesos asociados.');
      }
      throw error;
    }
  }
}
