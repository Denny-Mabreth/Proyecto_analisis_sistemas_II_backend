import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { Municipalidad } from '../../municipalidades/entities/municipalidad.entity.js';
import { LineaEstacion } from '../../lineas/entities/linea-estacion.entity.js';
import { Acceso } from '../../accesos/entities/acceso.entity.js';
import { Parqueo } from '../../parqueos/entities/parqueo.entity.js';

@Entity('estaciones')
export class Estacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  // Cada estación pertenece a una municipalidad
  @ManyToOne(() => Municipalidad)
  municipalidad: Relation<Municipalidad>;

  // Relación con líneas a través de la tabla intermedia
  @OneToMany(() => LineaEstacion, lineaEstacion => lineaEstacion.estacion)
  lineasEstaciones: Relation<LineaEstacion>[];

  @OneToMany(() => Acceso, acceso => acceso.estacion)
  accesos: Relation<Acceso>[];

  @OneToMany(() => Parqueo, parqueo => parqueo.estacion)
  parqueos: Relation<Parqueo>[];
}
