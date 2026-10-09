import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Linea } from './entities/linea.entity.js';
import { CreateLineaDto } from './dto/create-linea.dto.js';
import { UpdateLineaDto } from './dto/update-linea.dto.js';
import { AddEstacionDto } from './dto/add-estacion.dto.js';
import { Municipalidad } from '../municipalidades/entities/municipalidad.entity.js';
import { LineaEstacion } from './entities/linea-estacion.entity.js';
import { Estacion } from '../estaciones/entities/estacion.entity.js';

@Injectable()
export class LineasService {
  constructor(
    @InjectRepository(Linea)
    private lineasRepository: Repository<Linea>,
    @InjectRepository(Municipalidad)
    private municipalidadRepository: Repository<Municipalidad>,
    @InjectRepository(LineaEstacion)
    private lineaEstacionRepository: Repository<LineaEstacion>,
    @InjectRepository(Estacion)
    private estacionRepository: Repository<Estacion>,
  ) {}

  async create(createLineaDto: CreateLineaDto): Promise<Linea> {
    const municipalidad = await this.municipalidadRepository.findOneBy({ id: createLineaDto.municipalidadId });
    if (!municipalidad) {
      throw new NotFoundException(`Municipalidad con ID ${createLineaDto.municipalidadId} no encontrada`);
    }

    const nuevaLinea = this.lineasRepository.create({
      ...createLineaDto,
      municipalidad,
    });
    return this.lineasRepository.save(nuevaLinea);
  }

  findAll(): Promise<Linea[]> {
    return this.lineasRepository.find({
      relations: {
        municipalidad: true,
        lineasEstaciones: {
          estacion: true
        }
      },
    });
  }

  async findOne(id: number): Promise<Linea> {
    const linea = await this.lineasRepository.findOne({
      where: { id },
      relations: {
        municipalidad: true,
        lineasEstaciones: {
          estacion: true
        },
        buses: true,
      },
    });
    if (!linea) {
      throw new NotFoundException(`Línea con ID ${id} no encontrada`);
    }
    return linea;
  }

  async update(id: number, updateLineaDto: UpdateLineaDto): Promise<Linea> {
    const linea = await this.findOne(id);

    if (updateLineaDto.municipalidadId) {
      const municipalidad = await this.municipalidadRepository.findOneBy({ id: updateLineaDto.municipalidadId });
      if (!municipalidad) {
        throw new NotFoundException(`Municipalidad con ID ${updateLineaDto.municipalidadId} no encontrada`);
      }
      linea.municipalidad = municipalidad;
    }

    if (updateLineaDto.nombre !== undefined) linea.nombre = updateLineaDto.nombre;
    if (updateLineaDto.distancia_km !== undefined) linea.distancia_km = updateLineaDto.distancia_km;

    return this.lineasRepository.save(linea);
  }

  async addEstacion(lineaId: number, addEstacionDto: AddEstacionDto): Promise<LineaEstacion> {
    const linea = await this.findOne(lineaId);
    const estacion = await this.estacionRepository.findOneBy({ id: addEstacionDto.estacionId });
    
    if (!estacion) {
      throw new NotFoundException(`Estacion con ID ${addEstacionDto.estacionId} no encontrada`);
    }

    // Validar si ya existe para actualizar el orden, o crear uno nuevo
    let lineaEstacion = await this.lineaEstacionRepository.findOne({
      where: { linea: { id: lineaId }, estacion: { id: addEstacionDto.estacionId } }
    });

    if (lineaEstacion) {
      lineaEstacion.orden = addEstacionDto.orden;
    } else {
      lineaEstacion = this.lineaEstacionRepository.create({
        linea,
        estacion,
        orden: addEstacionDto.orden,
      });
    }

    return this.lineaEstacionRepository.save(lineaEstacion);
  }

  async removeEstacion(lineaId: number, estacionId: number): Promise<void> {
    const lineaEstacion = await this.lineaEstacionRepository.findOne({
      where: { linea: { id: lineaId }, estacion: { id: estacionId } }
    });
    if (!lineaEstacion) {
      throw new NotFoundException(`La estacion ${estacionId} no esta asignada a la linea ${lineaId}`);
    }
    await this.lineaEstacionRepository.remove(lineaEstacion);
  }

  async remove(id: number): Promise<void> {
    const linea = await this.findOne(id);
    await this.lineasRepository.remove(linea);
  }
}
