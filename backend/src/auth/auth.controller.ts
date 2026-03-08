import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}
	
	@Post('register')
  @ApiOperation({ summary: 'Cadastrar novo treinador' })
  @ApiResponse({ status: 201, description: 'Treinador cadastrado com sucesso' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado' })
	register(@Body() dto: RegisterDto) {
		return this.authService.register(dto);
	}
	
	@Post('login')
  @ApiOperation({ summary: 'Autenticar treinador' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}
	
	// Exemplo de rota protegida — retorna os dados do usuário logado
	@UseGuards(JwtAuthGuard)
	@Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna dados do treinador autenticado' })
  @ApiResponse({ status: 200, description: 'Dados do treinador' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
	getProfile(@Request() req) {
		return req.user;
	}
}