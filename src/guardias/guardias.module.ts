import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardiasService } from './guardias.service.js';
import { GuardiasController } from './guardias.controller.js';
import { Guardia } from './entities/guardia.entity.js';
import { Acceso } from '../accesos/entities/acceso.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Guardia, Acceso])],
  controllers: [GuardiasController],
  providers: [GuardiasService],
  exports: [GuardiasService],
})
export class GuardiasModule {}
