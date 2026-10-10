import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parqueo } from './entities/parqueo.entity.js';
import { CreateParqueoDto } from './dto/create-parqueo.dto.js';
import { UpdateParqueoDto } from './dto/update-parqueo.dto.js';
import { Estacion } from '../estaciones/entities/estacion.entity.js';

@Injectable()
export class ParqueosService {
  constructor(
    @InjectRepository(Parqueo)
    private parqueosRepository: Repository<Parqueo>,
    @InjectRepository(Estacion)
    private estacionRepository: Repository<Estacion>,
  ) {}

  async create(createParqueoDto: CreateParqueoDto): Promise<Parqueo> {
    const nuevoParqueo = this.parqueosRepository.create({
      nombre: createParqueoDto.nombre,
    });

    if (createParqueoDto.estacionId) {
      const estacion = await this.estacionRepository.findOneBy({ id: createParqueoDto.estacionId });
      if (!estacion) {
        throw new NotFoundException(`Estación con ID ${createParqueoDto.estacionId} no encontrada`);
      }
      nuevoParqueo.estacion = estacion;
    }

    return this.parqueosRepository.save(nuevoParqueo);
  }

  findAll(): Promise<Parqueo[]> {
    return this.parqueosRepository.find({
      relations: {
        estacion: true,
      },
    });
  }

  async findOne(id: number): Promise<Parqueo> {
    const parqueo = await this.parqueosRepository.findOne({
      where: { id },
      relations: {
        estacion: true,
        buses: true,
      },
    });
    if (!parqueo) {
      throw new NotFoundException(`Parqueo con ID ${id} no encontrado`);
    }
    return parqueo;
  }

  async update(id: number, updateParqueoDto: UpdateParqueoDto): Promise<Parqueo> {
    const parqueo = await this.findOne(id);

    if (updateParqueoDto.estacionId !== undefined) {
      if (updateParqueoDto.estacionId === null) {
        parqueo.estacion = null as any; // Tipado forzado para TypeORM
      } else {
        const estacion = await this.estacionRepository.findOneBy({ id: updateParqueoDto.estacionId });
        if (!estacion) {
          throw new NotFoundException(`Estación con ID ${updateParqueoDto.estacionId} no encontrada`);
        }
        parqueo.estacion = estacion;
      }
    }

    if (updateParqueoDto.nombre !== undefined) parqueo.nombre = updateParqueoDto.nombre;

    return this.parqueosRepository.save(parqueo);
  }

  async remove(id: number): Promise<void> {
    const parqueo = await this.findOne(id);
    try {
      await this.parqueosRepository.remove(parqueo);
    } catch (error: any) {
      if (error.code === '23503') {
        throw new BadRequestException('No se puede eliminar el parqueo porque está referenciado por otros registros (ej. buses asignados).');
      }
      throw error;
    }
  }
}
