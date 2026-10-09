import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bus } from './entities/bus.entity.js';
import { CreateBusDto } from './dto/create-bus.dto.js';
import { UpdateBusDto } from './dto/update-bus.dto.js';
import { Linea } from '../lineas/entities/linea.entity.js';
import { Parqueo } from '../parqueos/entities/parqueo.entity.js';
import { Piloto } from '../pilotos/entities/piloto.entity.js';

@Injectable()
export class BusesService {
  constructor(
    @InjectRepository(Bus)
    private busesRepository: Repository<Bus>,
    @InjectRepository(Linea)
    private lineaRepository: Repository<Linea>,
    @InjectRepository(Parqueo)
    private parqueoRepository: Repository<Parqueo>,
    @InjectRepository(Piloto)
    private pilotoRepository: Repository<Piloto>,
  ) {}

  private async validarMaximoBusesLinea(lineaId: number): Promise<Linea> {
    const linea = await this.lineaRepository.findOne({
      where: { id: lineaId },
      relations: {
        lineasEstaciones: true,
        buses: true,
      },
    });
    if (!linea) throw new NotFoundException(`Línea con ID ${lineaId} no encontrada`);

    const numEstaciones = linea.lineasEstaciones ? linea.lineasEstaciones.length : 0;
    const maxBuses = numEstaciones * 2;
    
    if (linea.buses && linea.buses.length >= maxBuses) {
      throw new BadRequestException(
        `La línea no puede aceptar más buses. Límite alcanzado (${maxBuses} buses máximo, que es el doble de sus ${numEstaciones} estaciones)`
      );
    }
    return linea;
  }

  async create(createBusDto: CreateBusDto): Promise<Bus> {
    const parqueo = await this.parqueoRepository.findOneBy({ id: createBusDto.parqueoId });
    if (!parqueo) throw new NotFoundException('Parqueo no encontrado (Un bus no puede quedar sin parqueo)');

    const bus = this.busesRepository.create({
      placa: createBusDto.placa,
      capacidad_maxima: createBusDto.capacidad_maxima,
    });

    bus.parqueo = parqueo;

    if (createBusDto.lineaId) {
      const linea = await this.validarMaximoBusesLinea(createBusDto.lineaId);
      bus.linea = linea;
    }

    if (createBusDto.pilotoId) {
      const piloto = await this.pilotoRepository.findOneBy({ id: createBusDto.pilotoId });
      if (!piloto) throw new NotFoundException('Piloto no encontrado');
      bus.piloto = piloto;
    }

    return this.busesRepository.save(bus);
  }

  findAll(): Promise<Bus[]> {
    return this.busesRepository.find({
      relations: {
        parqueo: true,
        linea: true,
        piloto: true,
      },
    });
  }

  async findOne(id: number): Promise<Bus> {
    const bus = await this.busesRepository.findOne({
      where: { id },
      relations: {
        parqueo: true,
        linea: true,
        piloto: true,
      },
    });
    if (!bus) throw new NotFoundException(`Bus con ID ${id} no encontrado`);
    return bus;
  }

  async update(id: number, updateBusDto: UpdateBusDto): Promise<Bus> {
    const bus = await this.findOne(id);

    if (updateBusDto.placa !== undefined) bus.placa = updateBusDto.placa;
    if (updateBusDto.capacidad_maxima !== undefined) bus.capacidad_maxima = updateBusDto.capacidad_maxima;

    if (updateBusDto.parqueoId !== undefined) {
      const parqueo = await this.parqueoRepository.findOneBy({ id: updateBusDto.parqueoId });
      if (!parqueo) throw new NotFoundException('Parqueo no encontrado');
      bus.parqueo = parqueo;
    }

    if (updateBusDto.lineaId !== undefined) {
      if (updateBusDto.lineaId === null) {
        bus.linea = null as any;
      } else {
        const linea = await this.validarMaximoBusesLinea(updateBusDto.lineaId);
        bus.linea = linea;
      }
    }

    if (updateBusDto.pilotoId !== undefined) {
      if (updateBusDto.pilotoId === null) {
        bus.piloto = null as any;
      } else {
        const piloto = await this.pilotoRepository.findOneBy({ id: updateBusDto.pilotoId });
        if (!piloto) throw new NotFoundException('Piloto no encontrado');
        bus.piloto = piloto;
      }
    }

    return this.busesRepository.save(bus);
  }

  async remove(id: number): Promise<void> {
    const bus = await this.findOne(id);
    await this.busesRepository.remove(bus);
  }
}
