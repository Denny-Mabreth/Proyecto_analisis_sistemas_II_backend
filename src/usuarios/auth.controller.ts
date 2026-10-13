import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.usuariosService.login(loginDto);
  }
}
