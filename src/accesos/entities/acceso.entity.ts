import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { Estacion } from '../../estaciones/entities/estacion.entity.js';
import { Guardia } from '../../guardias/entities/guardia.entity.js';

@Entity('accesos')
export class Acceso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  // Cada acceso pertenece solo a una estación
  @ManyToOne(() => Estacion, estacion => estacion.accesos)
  estacion: Relation<Estacion>;

  // Un acceso puede tener múltiples guardias (al menos uno según el requerimiento)
  @OneToMany(() => Guardia, guardia => guardia.acceso)
  guardias: Relation<Guardia>[];
}
