import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { Estacion } from '../../estaciones/entities/estacion.entity.js';
import { Bus } from '../../buses/entities/bus.entity.js';

@Entity('parqueos')
export class Parqueo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  // Algunas estaciones tienen parqueos asignados
  @ManyToOne(() => Estacion, estacion => estacion.parqueos, { nullable: true })
  estacion: Relation<Estacion>;

  @OneToMany(() => Bus, bus => bus.parqueo)
  buses: Relation<Bus>[];
}
