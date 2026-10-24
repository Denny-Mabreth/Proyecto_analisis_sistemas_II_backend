import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstacionesService } from './estaciones.service.js';
import { EstacionesController } from './estaciones.controller.js';
import { Estacion } from './entities/estacion.entity.js';
import { Municipalidad } from '../municipalidades/entities/municipalidad.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Estacion, Municipalidad])],
  controllers: [EstacionesController],
  providers: [EstacionesService],
  exports: [EstacionesService],
})
export class EstacionesModule {}
