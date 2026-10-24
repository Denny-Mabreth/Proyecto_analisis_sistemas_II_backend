import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { Acceso } from '../../accesos/entities/acceso.entity.js';

@Entity('guardias')
export class Guardia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  dpi: string;

  // Cada guardia está asignado a un acceso de una estación
  @ManyToOne(() => Acceso, acceso => acceso.guardias, { nullable: true })
  acceso?: Relation<Acceso>;
}
