import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MonitoreoService } from './monitoreo.service.js';

@Controller('monitoreo')
export class MonitoreoController {
  constructor(private readonly monitoreoService: MonitoreoService) {}

  @Get()
  snapshot() {
    return this.monitoreoService.snapshot();
  }

  @Post('pausa')
  pausa(@Body() body: { pausado: boolean }) {
    return this.monitoreoService.pausar(!!body?.pausado);
  }

  @Post('estaciones/:id/aglomeracion')
  aglomeracion(@Param('id') id: string) {
    return this.monitoreoService.inyectarAglomeracion(+id);
  }
}
