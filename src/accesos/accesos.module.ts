import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccesosService } from './accesos.service.js';
import { AccesosController } from './accesos.controller.js';
import { Acceso } from './entities/acceso.entity.js';
import { Estacion } from '../estaciones/entities/estacion.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Acceso, Estacion])],
  controllers: [AccesosController],
  providers: [AccesosService],
  exports: [AccesosService],
})
export class AccesosModule {}
