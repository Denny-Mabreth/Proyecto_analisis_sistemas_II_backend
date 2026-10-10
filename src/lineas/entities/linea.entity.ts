import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { Municipalidad } from '../../municipalidades/entities/municipalidad.entity.js';
import { LineaEstacion } from './linea-estacion.entity.js';
import { Bus } from '../../buses/entities/bus.entity.js';

@Entity('lineas')
export class Linea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'float', default: 0 })
  distancia_km: number;

  @Column({ type: 'boolean', default: false })
  es_circuito: boolean;

  // Cada Línea pertenece a una municipalidad
  @ManyToOne(() => Municipalidad)
  municipalidad: Relation<Municipalidad>;

  // Relación con estaciones a través de una tabla intermedia para guardar el "orden"
  @OneToMany(() => LineaEstacion, lineaEstacion => lineaEstacion.linea)
  lineasEstaciones: Relation<LineaEstacion>[];

  @OneToMany(() => Bus, bus => bus.linea)
  buses: Relation<Bus>[];
}
