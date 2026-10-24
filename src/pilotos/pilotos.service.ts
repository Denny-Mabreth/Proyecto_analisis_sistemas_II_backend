import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Piloto } from './entities/piloto.entity.js';
import { CreatePilotoDto } from './dto/create-piloto.dto.js';
import { UpdatePilotoDto } from './dto/update-piloto.dto.js';

@Injectable()
export class PilotosService {
  constructor(
    @InjectRepository(Piloto)
    private pilotosRepository: Repository<Piloto>,
  ) {}

  async create(createPilotoDto: CreatePilotoDto): Promise<Piloto> {
    const piloto = this.pilotosRepository.create(createPilotoDto);
    return this.pilotosRepository.save(piloto);
  }

  findAll(): Promise<Piloto[]> {
    return this.pilotosRepository.find({
      relations: { buses: true }
    });
  }

  async findOne(id: number): Promise<Piloto> {
    const piloto = await this.pilotosRepository.findOne({
      where: { id },
      relations: { buses: true }
    });
    if (!piloto) throw new NotFoundException(`Piloto con ID ${id} no encontrado`);
    return piloto;
  }

  async update(id: number, updatePilotoDto: UpdatePilotoDto): Promise<Piloto> {
    const piloto = await this.findOne(id);
    Object.assign(piloto, updatePilotoDto);
    return this.pilotosRepository.save(piloto);
  }

  async remove(id: number): Promise<void> {
    const piloto = await this.findOne(id);
    try {
      await this.pilotosRepository.remove(piloto);
    } catch (error: any) {
      if (error.code === '23503') {
        throw new BadRequestException('No se puede eliminar el piloto porque está asignado a uno o más buses.');
      }
      throw error;
    }
  }
}
