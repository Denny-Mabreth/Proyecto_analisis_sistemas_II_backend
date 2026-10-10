import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Acceso } from './entities/acceso.entity.js';
import { CreateAccesoDto } from './dto/create-acceso.dto.js';
import { UpdateAccesoDto } from './dto/update-acceso.dto.js';
import { Estacion } from '../estaciones/entities/estacion.entity.js';

@Injectable()
export class AccesosService {
  constructor(
    @InjectRepository(Acceso)
    private accesosRepository: Repository<Acceso>,
    @InjectRepository(Estacion)
    private estacionRepository: Repository<Estacion>,
  ) {}

  async create(createAccesoDto: CreateAccesoDto): Promise<Acceso> {
    const estacion = await this.estacionRepository.findOneBy({ id: createAccesoDto.estacionId });
    if (!estacion) throw new NotFoundException('Estación no encontrada');

    const acceso = this.accesosRepository.create({
      nombre: createAccesoDto.nombre,
      estacion,
    });
    return this.accesosRepository.save(acceso);
  }

  findAll(): Promise<Acceso[]> {
    return this.accesosRepository.find({
      relations: { estacion: true, guardias: true }
    });
  }

  async findOne(id: number): Promise<Acceso> {
    const acceso = await this.accesosRepository.findOne({
      where: { id },
      relations: { estacion: true, guardias: true }
    });
    if (!acceso) throw new NotFoundException(`Acceso con ID ${id} no encontrado`);
    return acceso;
  }

  async update(id: number, updateAccesoDto: UpdateAccesoDto): Promise<Acceso> {
    const acceso = await this.findOne(id);
    if (updateAccesoDto.nombre) acceso.nombre = updateAccesoDto.nombre;
    if (updateAccesoDto.estacionId) {
      const estacion = await this.estacionRepository.findOneBy({ id: updateAccesoDto.estacionId });
      if (!estacion) throw new NotFoundException('Estación no encontrada');
      acceso.estacion = estacion;
    }
    return this.accesosRepository.save(acceso);
  }

  async remove(id: number): Promise<void> {
    const acceso = await this.findOne(id);
    try {
      await this.accesosRepository.remove(acceso);
    } catch (error: any) {
      if (error.code === '23503') {
        throw new BadRequestException('No se puede eliminar el acceso porque tiene guardias u otros registros dependientes.');
      }
      throw error;
    }
  }
}
