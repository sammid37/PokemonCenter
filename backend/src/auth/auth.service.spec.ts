import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

// Mocka o módulo inteiro do bcryptjs — evita o erro "Cannot redefine property"
jest.mock('bcryptjs', () => ({
	hash: jest.fn(),
	compare: jest.fn(),
}));

// Importa depois do mock para pegar a versão mockada
import * as bcrypt from 'bcryptjs';

const mockUser = (): User => ({
	id: 'uuid-123',
	name: 'Ash Ketchum',
	email: 'ash@pokemon.com',
	password: 'hashed_password',
	createdAt: new Date(),
});

const mockUsersService = () => ({
	findByEmail: jest.fn(),
	create: jest.fn(),
});

const mockJwtService = () => ({
	sign: jest.fn().mockReturnValue('mock_token'),
});

describe('AuthService', () => {
	let service: AuthService;
	let usersService: jest.Mocked<UsersService>;
	let jwtService: jest.Mocked<JwtService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: UsersService, useFactory: mockUsersService },
				{ provide: JwtService, useFactory: mockJwtService },
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		usersService = module.get(UsersService);
		jwtService = module.get(JwtService);

		// Reseta os mocks do bcrypt antes de cada teste
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('register', () => {
		it('deve registrar um usuário e retornar o token', async () => {
			const user = mockUser();

			// Usa mockResolvedValue diretamente na função mockada
			(bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
			usersService.create.mockResolvedValue(user);

			const result = await service.register({
				name: 'Ash Ketchum',
				email: 'ash@pokemon.com',
				password: '123456',
			});

			expect(result).toEqual({ access_token: 'mock_token' });
			expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
			expect(jwtService.sign).toHaveBeenCalledWith({
				sub: user.id,
				email: user.email,
			});
		});
	});

	describe('login', () => {
		it('deve autenticar o usuário e retornar o token', async () => {
			const user = mockUser();

			usersService.findByEmail.mockResolvedValue(user);
			(bcrypt.compare as jest.Mock).mockResolvedValue(true);

			const result = await service.login({
				email: 'ash@pokemon.com',
				password: '123456',
			});

			expect(result).toEqual({ access_token: 'mock_token' });
		});

		it('deve lançar UnauthorizedException quando usuário não existe', async () => {
			usersService.findByEmail.mockResolvedValue(null);

			await expect(
				service.login({ email: 'inexistente@pokemon.com', password: '123456' }),
			).rejects.toThrow(UnauthorizedException);

			// Garante que o bcrypt não foi chamado desnecessariamente
			expect(bcrypt.compare).not.toHaveBeenCalled();
		});

		it('deve lançar UnauthorizedException quando senha está incorreta', async () => {
			const user = mockUser();

			usersService.findByEmail.mockResolvedValue(user);
			(bcrypt.compare as jest.Mock).mockResolvedValue(false);

			await expect(
				service.login({ email: 'ash@pokemon.com', password: 'senha_errada' }),
			).rejects.toThrow(UnauthorizedException);
		});
	});
});
