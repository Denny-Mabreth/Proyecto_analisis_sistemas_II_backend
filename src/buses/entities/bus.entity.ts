import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { Linea } from '../../lineas/entities/linea.entity.js';
import { Parqueo } from '../../parqueos/entities/parqueo.entity.js';
import { Piloto } from '../../pilotos/entities/piloto.entity.js';

@Entity('buses')
export class Bus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  placa: string;

  @Column({ type: 'int' })
  capacidad_maxima: number;

  // Utilizado para calcular la regla de alerta del 50% de sobrecapacidad o la de <25% de uso
  @Column({ type: 'int', default: 0 })
  pasajeros_actuales: number;

  // "no pudiendo suceder que un bus esté asignado a más de una línea, pero sí que no esté asignado a ninguna"
  @ManyToOne(() => Linea, linea => linea.buses, { nullable: true, onDelete: 'SET NULL' })
  linea: Relation<Linea>;

  // "Un bus puede cambiar de parqueo, pero no quedar sin él"
  @ManyToOne(() => Parqueo, parqueo => parqueo.buses, { nullable: false })
  parqueo: Relation<Parqueo>;

  @ManyToOne(() => Piloto, piloto => piloto.buses, { nullable: true })
  piloto: Relation<Piloto>;
}
