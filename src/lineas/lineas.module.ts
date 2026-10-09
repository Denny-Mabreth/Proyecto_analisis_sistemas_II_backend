import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LineasService } from './lineas.service.js';
import { LineasController } from './lineas.controller.js';
import { Linea } from './entities/linea.entity.js';
import { LineaEstacion } from './entities/linea-estacion.entity.js';
import { Municipalidad } from '../municipalidades/entities/municipalidad.entity.js';
import { Estacion } from '../estaciones/entities/estacion.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Linea, LineaEstacion, Municipalidad, Estacion])],
  controllers: [LineasController],
  providers: [LineasService],
  exports: [LineasService],
})
export class LineasModule {}
