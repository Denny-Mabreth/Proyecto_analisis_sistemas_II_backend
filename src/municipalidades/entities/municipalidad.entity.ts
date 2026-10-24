import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('municipalidades')
export class Municipalidad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;
}
