import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MunicipalidadesModule } from './municipalidades/municipalidades.module.js';
import { LineasModule } from './lineas/lineas.module.js';
import { EstacionesModule } from './estaciones/estaciones.module.js';
import { ParqueosModule } from './parqueos/parqueos.module.js';
import { BusesModule } from './buses/buses.module.js';
import { PilotosModule } from './pilotos/pilotos.module.js';
import { AccesosModule } from './accesos/accesos.module.js';
import { GuardiasModule } from './guardias/guardias.module.js';
import { MonitoreoModule } from './monitoreo/monitoreo.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [import.meta.dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // ¡Solo para desarrollo! Crea las tablas automáticamente basado en tus clases
    }),
    MunicipalidadesModule,
    LineasModule,
    EstacionesModule,
    ParqueosModule,
    BusesModule,
    PilotosModule,
    AccesosModule,
    GuardiasModule,
    MonitoreoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
