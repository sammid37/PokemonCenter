import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsController } from './pokemons.controller';
import { PokemonsService } from './pokemons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { PokemonStatus } from './enums/pokemon-status.enum';
import { Pokemon } from './entities/pokemon.entity';
import { User } from '../users/entities/user.entity';

// ------------------------------------------------------------------ //
// Mocks
// ------------------------------------------------------------------ //

const mockPokemonsService = () => ({
	findAll: jest.fn(),
	findOne: jest.fn(),
	create: jest.fn(),
	update: jest.fn(),
	remove: jest.fn(),
});

const mockTrainerRequest = () => ({
	user: {
		id: 'trainer-uuid',
		email: 'ash@pokemon.com',
		name: 'Ash Ketchum',
		role: UserRole.TRAINER,
	},
});

const mockNurseRequest = () => ({
	user: {
		id: 'nurse-uuid',
		email: 'joy@pokemon.com',
		name: 'Enfermeira Joy',
		role: UserRole.NURSE,
	},
});

const mockPokemon = (): Pokemon => ({
	id: 'pokemon-uuid',
	name: 'pikachu',
	nickname: 'Pika',
	pokedexNumber: 25,
	level: 50,
	hp: 100,
	height: 0.4,
	weight: 6.0,
	types: [],
	gender: 'Male' as any,
	healthStatus: PokemonStatus.HEALTHY,
	createdBy: { id: 'trainer-uuid' } as User,
	createdAt: new Date(),
	updatedAt: new Date(),
});

describe('PokemonsController', () => {
	let controller: PokemonsController;
	let pokemonsService: jest.Mocked<PokemonsService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [PokemonsController],
			providers: [
				{ provide: PokemonsService, useFactory: mockPokemonsService },
			],
		})
			// Substitui os guards reais — autenticação e autorização são testadas nos seus próprios testes
			.overrideGuard(JwtAuthGuard)
			.useValue({ canActivate: () => true })
			.overrideGuard(RolesGuard)
			.useValue({ canActivate: () => true })
			.compile();

		controller = module.get<PokemonsController>(PokemonsController);
		pokemonsService = module.get(PokemonsService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	// ------------------------------------------------------------------ //
	describe('findAll', () => {
		it('deve retornar todos os pokémons quando usuário for enfermeira', async () => {
			const pokemons = [mockPokemon()];
			pokemonsService.findAll.mockResolvedValue(pokemons);

			const result = await controller.findAll(mockNurseRequest());

			expect(result).toEqual(pokemons);

			// Enfermeira passa undefined para receber todos os pokémons
			expect(pokemonsService.findAll).toHaveBeenCalledWith(undefined);
		});

		it('deve retornar apenas os pokémons do treinador quando usuário for treinador', async () => {
			const pokemons = [mockPokemon()];
			pokemonsService.findAll.mockResolvedValue(pokemons);

			const result = await controller.findAll(mockTrainerRequest());

			expect(result).toEqual(pokemons);

			// Treinador passa seu próprio id para filtrar apenas seus pokémons
			expect(pokemonsService.findAll).toHaveBeenCalledWith('trainer-uuid');
		});
	});

	// ------------------------------------------------------------------ //
	describe('findOne', () => {
		it('deve retornar um pokémon pelo id', async () => {
			const pokemon = mockPokemon();
			pokemonsService.findOne.mockResolvedValue(pokemon);

			const result = await controller.findOne('pokemon-uuid');

			expect(result).toEqual(pokemon);
			expect(pokemonsService.findOne).toHaveBeenCalledWith('pokemon-uuid');
		});
	});

	// ------------------------------------------------------------------ //
	describe('create', () => {
		it('deve criar um pokémon e associá-lo ao treinador autenticado', async () => {
			const pokemon = mockPokemon();
			const dto = {
				name: 'pikachu',
				pokedexNumber: 25,
				level: 50,
				hp: 100,
				height: 0.4,
				weight: 6.0,
				types: [],
				gender: 'Male' as any,
			};

			pokemonsService.create.mockResolvedValue(pokemon);

			const result = await controller.create(dto, mockTrainerRequest());

			expect(result).toEqual(pokemon);

			// Garante que o id do treinador autenticado é passado ao service
			expect(pokemonsService.create).toHaveBeenCalledWith(dto, 'trainer-uuid');
		});
	});

	// ------------------------------------------------------------------ //
	describe('update', () => {
		it('deve atualizar um pokémon passando o id do treinador autenticado', async () => {
			const pokemon = { ...mockPokemon(), level: 60 };
			const dto = { level: 60 };

			pokemonsService.update.mockResolvedValue(pokemon);

			const result = await controller.update(
				'pokemon-uuid',
				dto,
				mockTrainerRequest(),
			);

			expect(result).toEqual(pokemon);

			// Garante que o service recebe o id do pokémon, o dto e o id do dono
			expect(pokemonsService.update).toHaveBeenCalledWith(
				'pokemon-uuid',
				dto,
				'trainer-uuid',
			);
		});
	});

	// ------------------------------------------------------------------ //
	describe('remove', () => {
		it('deve excluir um pokémon passando o id do treinador autenticado', async () => {
			pokemonsService.remove.mockResolvedValue(undefined);

			const result = await controller.remove('pokemon-uuid', mockTrainerRequest());

			expect(result).toBeUndefined();

			// Garante que o service recebe o id do pokémon e o id do dono
			expect(pokemonsService.remove).toHaveBeenCalledWith(
				'pokemon-uuid',
				'trainer-uuid',
			);
		});
	});
});