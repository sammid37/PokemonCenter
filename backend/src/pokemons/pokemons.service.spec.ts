import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PokemonsService } from './pokemons.service';
import { Pokemon } from './entities/pokemon.entity';
import { UsersService } from '../users/users.service';
import { PokemonType } from './enums/pokemon-type.enum';
import { User } from '../users/entities/user.entity';

const mockUser = (): User => ({
	id: 'uuid-123',
	name: 'Ash Ketchum',
	email: 'ash@pokemon.com',
	password: 'hashed_password',
	createdAt: new Date(),
});

const mockPokemon = (): Pokemon => ({
	id: 'pokemon-uuid-123',
	name: 'Pikachu',
	types: [PokemonType.ELECTRIC],
	level: 25,
	hp: 55,
	pokedexNumber: 25,
	createdBy: mockUser(),
	createdAt: new Date(),
	updatedAt: new Date(),
});

const mockPokemonsRepository = () => ({
	find: jest.fn(),
	findOne: jest.fn(),
	create: jest.fn(),
	save: jest.fn(),
	remove: jest.fn(),
});

const mockUsersService = () => ({
	findById: jest.fn(),
});

describe('PokemonsService', () => {
	let service: PokemonsService;
	let repository: jest.Mocked<Repository<Pokemon>>;
	let usersService: jest.Mocked<UsersService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PokemonsService,
				{
					provide: getRepositoryToken(Pokemon),
					useFactory: mockPokemonsRepository,
				},
				{ provide: UsersService, useFactory: mockUsersService },
			],
		}).compile();

		service = module.get<PokemonsService>(PokemonsService);
		repository = module.get(getRepositoryToken(Pokemon));
		usersService = module.get(UsersService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findAll', () => {
		it('deve retornar uma lista de pokémons', async () => {
			const pokemons = [mockPokemon()];
			repository.find.mockResolvedValue(pokemons);

			const result = await service.findAll();

			expect(result).toEqual(pokemons);
			expect(repository.find).toHaveBeenCalled();
		});
	});

	describe('findOne', () => {
		it('deve retornar um pokémon quando encontrado', async () => {
			const pokemon = mockPokemon();
			repository.findOne.mockResolvedValue(pokemon);

			const result = await service.findOne('pokemon-uuid-123');

			expect(result).toEqual(pokemon);
		});

		it('deve lançar NotFoundException quando pokémon não existe', async () => {
			repository.findOne.mockResolvedValue(null);

			await expect(service.findOne('uuid-inexistente')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('create', () => {
		it('deve criar um pokémon com sucesso', async () => {
			const user = mockUser();
			const pokemon = mockPokemon();

			usersService.findById.mockResolvedValue(user);
			repository.create.mockReturnValue(pokemon);
			repository.save.mockResolvedValue(pokemon);

			const result = await service.create(
				{
					name: 'Pikachu',
					types: [PokemonType.ELECTRIC],
					level: 25,
					hp: 55,
					pokedexNumber: 25,
				},
				user.id,
			);

			expect(result).toEqual(pokemon);
			expect(usersService.findById).toHaveBeenCalledWith(user.id);
			expect(repository.save).toHaveBeenCalled();
		});
	});

	describe('update', () => {
		it('deve atualizar um pokémon quando o usuário é o dono', async () => {
			const pokemon = mockPokemon();
			const updatedPokemon = { ...pokemon, level: 30 };

			repository.findOne.mockResolvedValue(pokemon);
			repository.save.mockResolvedValue(updatedPokemon);

			const result = await service.update(
				'pokemon-uuid-123',
				{ level: 30 },
				'uuid-123', // mesmo ID do dono
			);

			expect(result.level).toBe(30);
		});

		it('deve lançar ForbiddenException quando usuário não é o dono', async () => {
			const pokemon = mockPokemon();
			repository.findOne.mockResolvedValue(pokemon);

			await expect(
				service.update(
					'pokemon-uuid-123',
					{ level: 30 },
					'uuid-outro-usuario', // ID diferente do dono
				),
			).rejects.toThrow(ForbiddenException);

			expect(repository.save).not.toHaveBeenCalled();
		});
	});

	describe('remove', () => {
		it('deve remover um pokémon quando o usuário é o dono', async () => {
			const pokemon = mockPokemon();
			repository.findOne.mockResolvedValue(pokemon);
			repository.remove.mockResolvedValue(pokemon);

			await service.remove('pokemon-uuid-123', 'uuid-123');

			expect(repository.remove).toHaveBeenCalledWith(pokemon);
		});

		it('deve lançar ForbiddenException quando usuário não é o dono', async () => {
			const pokemon = mockPokemon();
			repository.findOne.mockResolvedValue(pokemon);

			await expect(
				service.remove('pokemon-uuid-123', 'uuid-outro-usuario'),
			).rejects.toThrow(ForbiddenException);

			expect(repository.remove).not.toHaveBeenCalled();
		});
	});
});
