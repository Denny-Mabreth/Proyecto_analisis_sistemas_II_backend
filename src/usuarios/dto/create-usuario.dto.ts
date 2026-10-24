import type { UserRole } from '../entities/usuario.entity.js';

export class CreateUsuarioDto {
  nombre: string;
  username: string;
  telefono?: string;
  password: string;
  rol: UserRole;
  activo?: boolean;
}
