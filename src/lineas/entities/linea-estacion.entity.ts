import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { Linea } from './linea.entity.js';
import { Estacion } from '../../estaciones/entities/estacion.entity.js';

@Entity('linea_estacion')
export class LineaEstacion {
  @PrimaryGeneratedColumn()
  id: number;

  // El requerimiento dice: "es muy importante recoger la información de este orden"
  @Column({ type: 'int' })
  orden: number;

  @ManyToOne(() => Linea, linea => linea.lineasEstaciones)
  linea: Relation<Linea>;

  @ManyToOne(() => Estacion, estacion => estacion.lineasEstaciones)
  estacion: Relation<Estacion>;
}
