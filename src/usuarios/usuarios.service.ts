import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { Usuario } from './entities/usuario.entity.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { LoginDto } from './dto/login.dto.js';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function comparePassword(password: string, storedHash: string): boolean {
  if (!storedHash.includes(':')) {
    return password === storedHash;
  }
  const [salt, key] = storedHash.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = scryptSync(password, salt, 64);
  return timingSafeEqual(keyBuffer, derivedKey);
}

@Injectable()
export class UsuariosService implements OnModuleInit {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultUsers();
  }

  private async seedDefaultUsers() {
    try {
      // 1. Usuario Administrador por defecto
      const admin = await this.usuariosRepository.findOne({
        where: { username: 'admin' },
      });

      if (!admin) {
        const defaultAdmin = this.usuariosRepository.create({
          nombre: 'Administrador del Sistema',
          username: 'admin',
          telefono: '12345678',
          password: hashPassword('1234'),
          rol: 'Administrador',
          activo: true,
        });
        await this.usuariosRepository.save(defaultAdmin);
        this.logger.log('Usuario administrador por defecto creado exitosamente (user: admin, password: 1234)');
      }

      // 2. Usuario Monitor por defecto
      const monitor = await this.usuariosRepository.findOne({
        where: { username: 'monitor' },
      });

      if (!monitor) {
        const defaultMonitor = this.usuariosRepository.create({
          nombre: 'Monitor de Operaciones',
          username: 'monitor',
          telefono: '12345678',
          password: hashPassword('1234'),
          rol: 'Monitor',
          activo: true,
        });
        await this.usuariosRepository.save(defaultMonitor);
        this.logger.log('Usuario monitor por defecto creado exitosamente (user: monitor, password: 1234)');
      }
    } catch (error) {
      this.logger.error('Error al inicializar los usuarios por defecto', error);
    }
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.usuariosRepository.findOne({
      where: { username },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const isValid = comparePassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    // Retornamos la información del usuario sin el hash de la contraseña
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    const existing = await this.usuariosRepository.findOne({
      where: { username: createUsuarioDto.username },
    });

    if (existing) {
      throw new BadRequestException(`El nombre de usuario "${createUsuarioDto.username}" ya existe`);
    }

    const hashedPassword = hashPassword(createUsuarioDto.password);
    const nuevoUsuario = this.usuariosRepository.create({
      ...createUsuarioDto,
      password: hashedPassword,
    });

    const saved = await this.usuariosRepository.save(nuevoUsuario);
    const { password: _, ...safeUser } = saved;
    return safeUser;
  }

  async findAll() {
    const usuarios = await this.usuariosRepository.find({
      order: { id: 'ASC' },
      select: {
        id: true,
        nombre: true,
        username: true,
        telefono: true,
        rol: true,
        activo: true,
        fecha_creacion: true,
      },
    });
    return usuarios;
  }

  async findOne(id: number) {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
      select: {
        id: true,
        nombre: true,
        username: true,
        telefono: true,
        rol: true,
        activo: true,
        fecha_creacion: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuariosRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (updateUsuarioDto.username && updateUsuarioDto.username !== usuario.username) {
      const existing = await this.usuariosRepository.findOne({
        where: { username: updateUsuarioDto.username },
      });
      if (existing) {
        throw new BadRequestException(`El nombre de usuario "${updateUsuarioDto.username}" ya está en uso`);
      }
      usuario.username = updateUsuarioDto.username;
    }

    if (updateUsuarioDto.nombre !== undefined) {
      usuario.nombre = updateUsuarioDto.nombre;
    }

    if (updateUsuarioDto.telefono !== undefined) {
      usuario.telefono = updateUsuarioDto.telefono;
    }

    if (updateUsuarioDto.rol !== undefined) {
      usuario.rol = updateUsuarioDto.rol;
    }

    if (updateUsuarioDto.activo !== undefined) {
      usuario.activo = updateUsuarioDto.activo;
    }

    if (updateUsuarioDto.password && updateUsuarioDto.password.trim() !== '') {
      usuario.password = hashPassword(updateUsuarioDto.password);
    }

    const saved = await this.usuariosRepository.save(usuario);
    const { password: _, ...safeUser } = saved;
    return safeUser;
  }

  async remove(id: number) {
    const usuario = await this.usuariosRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (usuario.username === 'admin') {
      throw new BadRequestException('No se permite eliminar al usuario administrador principal');
    }

    await this.usuariosRepository.remove(usuario);
    return { success: true, message: `Usuario #${id} eliminado correctamente` };
  }
}
