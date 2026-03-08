import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

const mockUser = (): User => ({
	id: 'uuid-123',
	name: 'Ash Ketchum',
	email: 'ash@pokemon.com',
	password: 'hashed_password',
	createdAt: new Date(),
});

const mockUsersRepository = () => ({
	findOne: jest.fn(),
	find: jest.fn(),
	create: jest.fn(),
	save: jest.fn(),
	createQueryBuilder: jest.fn(),
});

describe('UsersService', () => {
	let service: UsersService;
	let repository: jest.Mocked<Repository<User>>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: getRepositoryToken(User),
					useFactory: mockUsersRepository,
				},
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
		repository = module.get(getRepositoryToken(User));
	});

	// Garante que o serviço foi instanciado corretamente
	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findById', () => {
		it('deve retornar o usuário quando encontrado', async () => {
			const user = mockUser();
			repository.findOne.mockResolvedValue(user);

			const result = await service.findById('uuid-123');

			expect(result).toEqual(user);
			expect(repository.findOne).toHaveBeenCalledWith({
				where: { id: 'uuid-123' },
			});
		});

		it('deve lançar NotFoundException quando usuário não existe', async () => {
			repository.findOne.mockResolvedValue(null);

			await expect(service.findById('uuid-inexistente')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('create', () => {
		it('deve criar um usuário com sucesso', async () => {
			const user = mockUser();

			// Simula que não existe usuário com o e-mail
			repository.findOne.mockResolvedValue(null);
			repository.create.mockReturnValue(user);
			repository.save.mockResolvedValue(user);

			const result = await service.create({
				name: user.name,
				email: user.email,
				password: user.password,
			});

			expect(result).toEqual(user);
			expect(repository.save).toHaveBeenCalledWith(user);
		});

		it('deve lançar ConflictException quando e-mail já está cadastrado', async () => {
			const user = mockUser();

			// Simula que já existe um usuário com o e-mail
			repository.findOne.mockResolvedValue(user);

			await expect(
				service.create({ email: user.email, password: '123456' }),
			).rejects.toThrow(ConflictException);

			// Garante que o save não foi chamado
			expect(repository.save).not.toHaveBeenCalled();
		});
	});
});
