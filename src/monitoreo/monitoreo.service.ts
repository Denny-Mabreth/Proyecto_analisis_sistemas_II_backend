import { Injectable, OnModuleInit, OnModuleDestroy, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Linea } from '../lineas/entities/linea.entity.js';
import { Bus } from '../buses/entities/bus.entity.js';

/** Capacidad simulada de cada estación (el modelo de datos aún no la persiste). */
export const CAPACIDAD_ESTACION = 100;
/** Regla del enunciado: estación con al menos 50% más de su capacidad => alerta. */
const UMBRAL_ALERTA_ESTACION = CAPACIDAD_ESTACION * 1.5;
/** Regla del enunciado: bus con menos del 25% de ocupación espera 5 minutos más. */
const UMBRAL_BUS_VACIO = 0.25;
const MINUTOS_ESPERA_EXTRA = 5;
/** 1 tick = 1 minuto simulado. */
const TICK_MS = 2000;
const TICKS_POR_TRAMO = 5;
const TICKS_PARADA = 2;
const MAX_EVENTOS = 40;
const REFRESCO_TOPOLOGIA_TICKS = 5;

type EstadoBus = 'EN_RUTA' | 'EN_ESTACION' | 'ESPERANDO';

interface BusSim {
  id: number;
  placa: string;
  capacidad: number;
  pasajeros: number;
  lineaId: number;
  origen: number; // índice de estación (posición dentro de la línea)
  destino: number;
  progreso: number; // 0..1 dentro del tramo origen -> destino
  dir: 1 | -1;
  parada: number; // ticks restantes detenido en estación
  extraEspera: boolean;
  estado: EstadoBus;
}

interface LineaTopologia {
  id: number;
  nombre: string;
  es_circuito: boolean;
  estaciones: { id: number; nombre: string }[];
  busIds: number[];
}

export interface EventoMonitoreo {
  id: number;
  minuto: number;
  tipo: 'ALERTA' | 'RESUELTA' | 'ESPERA' | 'INFO';
  mensaje: string;
}

@Injectable()
export class MonitoreoService implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  private minuto = 0;
  private pausado = false;
  private contadorEventos = 0;

  private topologia: LineaTopologia[] = [];
  private busesSinLinea = 0;
  private totalBuses = 0;
  private busesInfo = new Map<number, { placa: string; capacidad: number }>();

  private buses = new Map<number, BusSim>();
  private esperando = new Map<number, number>(); // estacionId -> pasajeros esperando
  private tasaLlegada = new Map<number, number>(); // estacionId -> pasajeros/tick (máx)
  private alertasEstacion = new Set<number>();
  private eventos: EventoMonitoreo[] = [];

  constructor(
    @InjectRepository(Linea) private readonly lineaRepo: Repository<Linea>,
    @InjectRepository(Bus) private readonly busRepo: Repository<Bus>,
  ) {}

  async onModuleInit() {
    await this.refrescarTopologia();
    this.timer = setInterval(() => {
      void this.tick();
    }, TICK_MS);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  // ------------------------------------------------------------------ Simulación

  private async tick() {
    if (this.pausado) return;
    try {
      if (this.minuto % REFRESCO_TOPOLOGIA_TICKS === 0) {
        await this.refrescarTopologia();
      }
      this.minuto++;
      this.generarPasajeros();
      for (const bus of this.buses.values()) this.avanzarBus(bus);
      this.evaluarAlertas();
    } catch (e) {
      // El monitoreo nunca debe tumbar el servidor
      console.error('[Monitoreo] error en tick', e);
    }
  }

  private async refrescarTopologia() {
    const lineas = await this.lineaRepo.find({
      relations: { lineasEstaciones: { estacion: true }, buses: true },
    });
    const todosBuses = await this.busRepo.find({ relations: { linea: true } });

    this.totalBuses = todosBuses.length;
    this.busesSinLinea = todosBuses.filter((b) => !b.linea).length;
    this.busesInfo.clear();
    for (const b of todosBuses) {
      this.busesInfo.set(b.id, { placa: b.placa, capacidad: b.capacidad_maxima });
    }

    this.topologia = lineas
      .map((l) => ({
        id: l.id,
        nombre: l.nombre,
        es_circuito: l.es_circuito,
        estaciones: [...(l.lineasEstaciones ?? [])]
          .sort((a, b) => a.orden - b.orden)
          .map((le) => ({ id: le.estacion.id, nombre: le.estacion.nombre })),
        busIds: (l.buses ?? []).map((b) => b.id),
      }))
      .filter((l) => l.estaciones.length >= 2);

    const busesVigentes = new Set<number>();
    const estacionesVigentes = new Set<number>();

    for (const linea of this.topologia) {
      const n = linea.estaciones.length;
      linea.estaciones.forEach((e) => {
        estacionesVigentes.add(e.id);
        if (!this.esperando.has(e.id)) {
          this.esperando.set(e.id, Math.floor(Math.random() * 40));
          this.tasaLlegada.set(e.id, 3 + Math.floor(Math.random() * 6)); // 3..8
        }
      });

      for (const busId of linea.busIds) {
        const info = this.busesInfo.get(busId);
        if (!info) continue;
        busesVigentes.add(busId);
        let sim = this.buses.get(busId);

        if (!sim || sim.lineaId !== linea.id) {
          const origen = Math.floor(Math.random() * n);
          sim = {
            id: busId,
            placa: info.placa,
            capacidad: info.capacidad,
            pasajeros: Math.floor(info.capacidad * (0.3 + Math.random() * 0.5)),
            lineaId: linea.id,
            origen,
            destino: 0,
            progreso: Math.random() * 0.8,
            dir: 1,
            parada: 0,
            extraEspera: false,
            estado: 'EN_RUTA',
          };
          sim.destino = this.siguiente(sim, linea);
          this.buses.set(busId, sim);
        } else {
          sim.placa = info.placa;
          sim.capacidad = info.capacidad;
          sim.pasajeros = Math.min(sim.pasajeros, info.capacidad);
          if (sim.origen >= n || sim.destino >= n) {
            sim.origen = Math.min(sim.origen, n - 1);
            sim.dir = 1;
            sim.destino = this.siguiente(sim, linea);
            sim.progreso = 0;
          }
        }
      }
    }

    for (const id of [...this.buses.keys()]) if (!busesVigentes.has(id)) this.buses.delete(id);
    for (const id of [...this.esperando.keys()]) {
      if (!estacionesVigentes.has(id)) {
        this.esperando.delete(id);
        this.tasaLlegada.delete(id);
        this.alertasEstacion.delete(id);
      }
    }
  }

  /** Calcula el índice de la siguiente estación; en líneas no circulares rebota en los extremos. */
  private siguiente(bus: BusSim, linea: LineaTopologia): number {
    const n = linea.estaciones.length;
    if (linea.es_circuito) {
      bus.dir = 1;
      return (bus.origen + 1) % n;
    }
    if (bus.origen + bus.dir > n - 1 || bus.origen + bus.dir < 0) bus.dir = bus.dir === 1 ? -1 : 1;
    return bus.origen + bus.dir;
  }

  private generarPasajeros() {
    for (const [id, tasa] of this.tasaLlegada) {
      const actual = this.esperando.get(id) ?? 0;
      const nuevos = Math.floor(Math.random() * (tasa + 1));
      this.esperando.set(id, Math.min(actual + nuevos, CAPACIDAD_ESTACION * 3));
    }
  }

  private avanzarBus(bus: BusSim) {
    const linea = this.topologia.find((l) => l.id === bus.lineaId);
    if (!linea) return;

    // Detenido en estación
    if (bus.parada > 0) {
      const estId = linea.estaciones[bus.origen].id;
      if (bus.estado === 'ESPERANDO') this.abordar(bus, estId); // sigue recogiendo gente durante la espera
      bus.parada--;
      if (bus.parada > 0) return;

      const ocupacion = bus.pasajeros / bus.capacidad;
      if (ocupacion < UMBRAL_BUS_VACIO && !bus.extraEspera) {
        bus.extraEspera = true;
        bus.parada = MINUTOS_ESPERA_EXTRA;
        bus.estado = 'ESPERANDO';
        this.log(
          'ESPERA',
          `Bus ${bus.placa} sale con ${Math.round(ocupacion * 100)}% de ocupación en ${linea.estaciones[bus.origen].nombre}: espera ${MINUTOS_ESPERA_EXTRA} min más`,
        );
        return;
      }
      // Sale hacia el siguiente tramo
      bus.extraEspera = false;
      bus.estado = 'EN_RUTA';
      bus.destino = this.siguiente(bus, linea);
      bus.progreso = 0;
      return;
    }

    // En ruta
    bus.progreso += 1 / TICKS_POR_TRAMO;
    if (bus.progreso >= 1) {
      bus.origen = bus.destino;
      bus.progreso = 0;
      bus.estado = 'EN_ESTACION';
      bus.parada = TICKS_PARADA;
      const estId = linea.estaciones[bus.origen].id;
      this.descender(bus);
      this.abordar(bus, estId);
    }
  }

  private descender(bus: BusSim) {
    const bajan = Math.ceil(bus.pasajeros * (0.2 + Math.random() * 0.4));
    bus.pasajeros = Math.max(0, bus.pasajeros - bajan);
  }

  private abordar(bus: BusSim, estacionId: number) {
    const hay = this.esperando.get(estacionId) ?? 0;
    const espacio = bus.capacidad - bus.pasajeros;
    const suben = Math.max(0, Math.min(hay, espacio));
    bus.pasajeros += suben;
    this.esperando.set(estacionId, hay - suben);
  }

  private evaluarAlertas() {
    const nombres = new Map<number, string>();
    this.topologia.forEach((l) => l.estaciones.forEach((e) => nombres.set(e.id, e.nombre)));

    for (const [id, cant] of this.esperando) {
      const nombre = nombres.get(id) ?? `#${id}`;
      const activa = this.alertasEstacion.has(id);
      if (cant >= UMBRAL_ALERTA_ESTACION && !activa) {
        this.alertasEstacion.add(id);
        this.log('ALERTA', `${nombre} supera el 150% de su capacidad (${cant}/${CAPACIDAD_ESTACION}): se requiere otro bus`);
      } else if (cant < CAPACIDAD_ESTACION && activa) {
        this.alertasEstacion.delete(id);
        this.log('RESUELTA', `${nombre} volvió a niveles normales (${cant}/${CAPACIDAD_ESTACION})`);
      }
    }
  }

  private log(tipo: EventoMonitoreo['tipo'], mensaje: string) {
    this.eventos.unshift({ id: ++this.contadorEventos, minuto: this.minuto, tipo, mensaje });
    if (this.eventos.length > MAX_EVENTOS) this.eventos.pop();
  }

  // ------------------------------------------------------------------ API pública

  pausar(valor: boolean) {
    this.pausado = valor;
    this.log('INFO', valor ? 'Simulación pausada por el operador' : 'Simulación reanudada');
    return { pausado: this.pausado };
  }

  /** Útil para demostrar la regla de alerta: dispara una aglomeración en una estación. */
  inyectarAglomeracion(estacionId: number) {
    if (!this.esperando.has(estacionId)) throw new NotFoundException('Estación sin actividad en ninguna línea');
    this.esperando.set(estacionId, Math.floor(UMBRAL_ALERTA_ESTACION) + 20);
    this.evaluarAlertas();
    return { ok: true };
  }

  snapshot() {
    const lineas = this.topologia.map((l) => {
      const n = l.estaciones.length;
      const buses = [...this.buses.values()].filter((b) => b.lineaId === l.id);
      const estaciones = l.estaciones.map((e, i) => {
        const esp = this.esperando.get(e.id) ?? 0;
        return {
          id: e.id,
          nombre: e.nombre,
          orden: i + 1,
          esperando: esp,
          capacidad: CAPACIDAD_ESTACION,
          ocupacion_pct: Math.round((esp / CAPACIDAD_ESTACION) * 100),
          alerta: this.alertasEstacion.has(e.id),
        };
      });
      const min = n;
      const max = n * 2;
      return {
        id: l.id,
        nombre: l.nombre,
        es_circuito: l.es_circuito,
        buses_requeridos_min: min,
        buses_requeridos_max: max,
        buses_asignados: l.busIds.length,
        cumple_flota: l.busIds.length >= min && l.busIds.length <= max,
        estaciones,
        buses: buses.map((b) => ({
          id: b.id,
          placa: b.placa,
          capacidad: b.capacidad,
          pasajeros: b.pasajeros,
          ocupacion_pct: Math.round((b.pasajeros / b.capacidad) * 100),
          estado: b.estado,
          origen: b.origen,
          destino: b.destino,
          progreso: b.estado === 'EN_RUTA' ? b.progreso : 0,
          espera_restante: b.estado === 'ESPERANDO' ? b.parada : 0,
        })),
      };
    });

    const todos = [...this.buses.values()];
    const totalPasajeros = todos.reduce((s, b) => s + b.pasajeros, 0);
    const capTotal = todos.reduce((s, b) => s + b.capacidad, 0);

    return {
      minuto: this.minuto,
      pausado: this.pausado,
      capacidad_estacion: CAPACIDAD_ESTACION,
      kpis: {
        lineas_activas: lineas.length,
        buses_en_operacion: todos.length,
        buses_total: this.totalBuses,
        buses_sin_linea: this.busesSinLinea,
        buses_esperando: todos.filter((b) => b.estado === 'ESPERANDO').length,
        pasajeros_a_bordo: totalPasajeros,
        ocupacion_flota_pct: capTotal ? Math.round((totalPasajeros / capTotal) * 100) : 0,
        pasajeros_esperando: [...this.esperando.values()].reduce((s, v) => s + v, 0),
        alertas_activas: this.alertasEstacion.size,
        lineas_fuera_de_norma: lineas.filter((l) => !l.cumple_flota).length,
      },
      lineas,
      eventos: this.eventos,
    };
  }
}
