import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoreoService } from './monitoreo.service.js';
import { MonitoreoController } from './monitoreo.controller.js';
import { Linea } from '../lineas/entities/linea.entity.js';
import { Bus } from '../buses/entities/bus.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Linea, Bus])],
  controllers: [MonitoreoController],
  providers: [MonitoreoService],
})
export class MonitoreoModule {}
