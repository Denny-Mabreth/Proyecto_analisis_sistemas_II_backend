import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PilotosService } from './pilotos.service.js';
import { PilotosController } from './pilotos.controller.js';
import { Piloto } from './entities/piloto.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Piloto])],
  controllers: [PilotosController],
  providers: [PilotosService],
  exports: [PilotosService],
})
export class PilotosModule {}
