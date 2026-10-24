import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guardia } from './entities/guardia.entity.js';
import { CreateGuardiaDto } from './dto/create-guardia.dto.js';
import { UpdateGuardiaDto } from './dto/update-guardia.dto.js';
import { Acceso } from '../accesos/entities/acceso.entity.js';

@Injectable()
export class GuardiasService {
  constructor(
    @InjectRepository(Guardia)
    private guardiasRepository: Repository<Guardia>,
    @InjectRepository(Acceso)
    private accesoRepository: Repository<Acceso>,
  ) {}

  async create(createGuardiaDto: CreateGuardiaDto): Promise<Guardia> {
    let acceso: Acceso | undefined = undefined;
    if (createGuardiaDto.accesoId) {
      const foundAcceso = await this.accesoRepository.findOneBy({ id: createGuardiaDto.accesoId });
      if (!foundAcceso) throw new NotFoundException('Acceso no encontrado');
      acceso = foundAcceso;
    }

    const guardia = this.guardiasRepository.create({
      nombre: createGuardiaDto.nombre,
      dpi: createGuardiaDto.dpi,
      acceso,
    });
    return this.guardiasRepository.save(guardia);
  }

  findAll(): Promise<Guardia[]> {
    return this.guardiasRepository.find({
      relations: { acceso: true }
    });
  }

  async findOne(id: number): Promise<Guardia> {
    const guardia = await this.guardiasRepository.findOne({
      where: { id },
      relations: { acceso: true }
    });
    if (!guardia) throw new NotFoundException(`Guardia con ID ${id} no encontrado`);
    return guardia;
  }

  async update(id: number, updateGuardiaDto: UpdateGuardiaDto): Promise<Guardia> {
    const guardia = await this.findOne(id);
    if (updateGuardiaDto.nombre) guardia.nombre = updateGuardiaDto.nombre;
    if (updateGuardiaDto.dpi) guardia.dpi = updateGuardiaDto.dpi;
    if (updateGuardiaDto.accesoId !== undefined) {
      if (updateGuardiaDto.accesoId === null) {
        guardia.acceso = null as any;
      } else {
        const acceso = await this.accesoRepository.findOneBy({ id: updateGuardiaDto.accesoId });
        if (!acceso) throw new NotFoundException('Acceso no encontrado');
        guardia.acceso = acceso;
      }
    }
    return this.guardiasRepository.save(guardia);
  }

  async remove(id: number): Promise<void> {
    const guardia = await this.findOne(id);
    await this.guardiasRepository.remove(guardia);
  }
}
