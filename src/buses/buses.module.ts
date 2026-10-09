import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusesService } from './buses.service.js';
import { BusesController } from './buses.controller.js';
import { Bus } from './entities/bus.entity.js';
import { Linea } from '../lineas/entities/linea.entity.js';
import { Parqueo } from '../parqueos/entities/parqueo.entity.js';
import { Piloto } from '../pilotos/entities/piloto.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Bus, Linea, Parqueo, Piloto])],
  controllers: [BusesController],
  providers: [BusesService],
  exports: [BusesService],
})
export class BusesModule {}
