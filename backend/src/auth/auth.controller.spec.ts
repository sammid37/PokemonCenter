import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRole } from '../users/enums/user-role.enum';

// ------------------------------------------------------------------ //
// Mocks
// ------------------------------------------------------------------ //

const mockAuthService = () => ({
	register: jest.fn(),
	login: jest.fn(),
});

// Usuário autenticado simulado — retornado pelo JwtAuthGuard via req.user
const mockAuthenticatedUser = (role: UserRole = UserRole.TRAINER) => ({
	id: 'uuid-123',
	email: 'ash@pokemon.com',
	name: 'Ash Ketchum',
	role,
});

describe('AuthController', () => {
	let controller: AuthController;
	let authService: jest.Mocked<AuthService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{ provide: AuthService, useFactory: mockAuthService },
			],
		})
			// Substitui o guard real por um que sempre permite a requisição
			.overrideGuard(JwtAuthGuard)
			.useValue({ canActivate: () => true })
			.compile();

		controller = module.get<AuthController>(AuthController);
		authService = module.get(AuthService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	// ------------------------------------------------------------------ //
	describe('register', () => {
		it('deve chamar authService.register e retornar o token', async () => {
			const dto = {
				name: 'Ash Ketchum',
				email: 'ash@pokemon.com',
				password: '123456',
				role: UserRole.TRAINER,
			};
			const token = { access_token: 'mock_token' };

			authService.register.mockResolvedValue(token);

			const result = await controller.register(dto);

			expect(result).toEqual(token);
			expect(authService.register).toHaveBeenCalledWith(dto);
		});

		it('deve registrar uma enfermeira Joy corretamente', async () => {
			const dto = {
				name: 'Enfermeira Joy',
				email: 'joy@pokemon.com',
				password: '123456',
				role: UserRole.NURSE,
			};
			const token = { access_token: 'mock_token' };

			authService.register.mockResolvedValue(token);

			const result = await controller.register(dto);

			expect(result).toEqual(token);
			expect(authService.register).toHaveBeenCalledWith(dto);
		});
	});

	// ------------------------------------------------------------------ //
	describe('login', () => {
		it('deve chamar authService.login e retornar o token', async () => {
			const dto = { email: 'ash@pokemon.com', password: '123456' };
			const token = { access_token: 'mock_token' };

			authService.login.mockResolvedValue(token);

			const result = await controller.login(dto);

			expect(result).toEqual(token);
			expect(authService.login).toHaveBeenCalledWith(dto);
		});
	});

	// ------------------------------------------------------------------ //
	describe('getProfile', () => {
		it('deve retornar os dados do treinador autenticado via req.user', () => {
			const user = mockAuthenticatedUser(UserRole.TRAINER);
			const req = { user };

			const result = controller.getProfile(req);

			expect(result).toEqual(user);
			expect(result.role).toBe(UserRole.TRAINER);
		});

		it('deve retornar os dados da enfermeira autenticada via req.user', () => {
			const user = mockAuthenticatedUser(UserRole.NURSE);
			const req = { user };

			const result = controller.getProfile(req);

			expect(result).toEqual(user);
			expect(result.role).toBe(UserRole.NURSE);
		});
	});
});