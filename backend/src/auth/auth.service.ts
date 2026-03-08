import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

	async register(dto: RegisterDto) {
		const hashedPassword = await bcrypt.hash(dto.password, 10);

		const user = await this.usersService.create({
			name: dto.name,
			email: dto.email,
			password: hashedPassword,
      role: dto.role,
		});

		return this.generateToken(user.id, user.email, user.role);
	}

	async login(dto: LoginDto) {
		const user = await this.usersService.findByEmail(dto.email);

		if (!user) {
			throw new UnauthorizedException('Credenciais inválidas');
		}

		const passwordMatch = await bcrypt.compare(dto.password, user.password);

		if (!passwordMatch) {
			// Mensagem genérica para não revelar se o e-mail existe ou não
			throw new UnauthorizedException('Credenciais inválidas');
		}

		return this.generateToken(user.id, user.email, user.role);
	}

	private generateToken(userId: string, email: string, role: string) {
		const payload = { sub: userId, email, role };
		return {
			access_token: this.jwtService.sign(payload),
		};
	}
}
