import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { Bus } from '../../buses/entities/bus.entity.js';

@Entity('pilotos')
export class Piloto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'text' })
  historial_educativo: string;

  @Column({ type: 'text' })
  residencia: string;

  @Column({ type: 'varchar', length: 20 })
  telefono: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  correo: string;

  // Un piloto puede tener asignado un bus (o varios en diferentes turnos)
  @OneToMany(() => Bus, bus => bus.piloto)
  buses: Relation<Bus>[];
}
