import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParqueosService } from './parqueos.service.js';
import { ParqueosController } from './parqueos.controller.js';
import { Parqueo } from './entities/parqueo.entity.js';
import { Estacion } from '../estaciones/entities/estacion.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Parqueo, Estacion])],
  controllers: [ParqueosController],
  providers: [ParqueosService],
  exports: [ParqueosService],
})
export class ParqueosModule {}
