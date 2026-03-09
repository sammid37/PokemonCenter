import { Test, TestingModule } from '@nestjs/testing';
import {
	NotFoundException,
	ForbiddenException,
	BadRequestException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PokemonActionsService } from './pokemon-actions.service';
import { PokemonsService } from '../pokemons/pokemons.service';
import { UsersService } from '../users/users.service';
import { PokemonAction } from './entities/pokemon-action.entity';
import { ActionStatus } from './enums/action-status.enum';
import { ActionType } from './enums/action-type.enum';
import { PokemonStatus } from '../pokemons/enums/pokemon-status.enum';
import { UserRole } from '../users/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { Pokemon } from '../pokemons/entities/pokemon.entity';

// ------------------------------------------------------------------ //
// Factories de mocks
// ------------------------------------------------------------------ //

const mockTrainer = (): User => ({
	id: 'trainer-uuid',
	name: 'Ash Ketchum',
	email: 'ash@pokemon.com',
	password: 'hashed_password',
	role: UserRole.TRAINER,
	createdAt: new Date(),
});

const mockNurse = (): User => ({
	id: 'nurse-uuid',
	name: 'Enfermeira Joy',
	email: 'joy@pokemon.com',
	password: 'hashed_password',
	role: UserRole.NURSE,
	createdAt: new Date(),
});

const mockPokemon = (ownerId = 'trainer-uuid'): Pokemon => ({
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
	createdBy: { id: ownerId } as User,
	createdAt: new Date(),
	updatedAt: new Date(),
});

const mockAction = (
	type: ActionType = ActionType.HEAL,
	status: ActionStatus = ActionStatus.PENDING,
): PokemonAction => ({
	id: 'action-uuid',
	type,
	status,
	trainerNote: null,
	nurseNote: null,
	pokemon: mockPokemon(),
	requestedBy: mockTrainer(),
	reviewedBy: null,
	createdAt: new Date(),
	updatedAt: new Date(),
});

// ------------------------------------------------------------------ //
// Mocks dos providers
// ------------------------------------------------------------------ //

const mockActionsRepository = () => ({
	find: jest.fn(),
	findOne: jest.fn(),
	create: jest.fn(),
	save: jest.fn(),
});

const mockPokemonsService = () => ({
	findOne: jest.fn(),
	update: jest.fn(),
});

const mockUsersService = () => ({
	findById: jest.fn(),
});

// ------------------------------------------------------------------ //
// Testes
// ------------------------------------------------------------------ //

describe('PokemonActionsService', () => {
	let service: PokemonActionsService;
	let actionsRepository: ReturnType<typeof mockActionsRepository>;
	let pokemonsService: jest.Mocked<PokemonsService>;
	let usersService: jest.Mocked<UsersService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PokemonActionsService,
				{
					provide: getRepositoryToken(PokemonAction),
					useFactory: mockActionsRepository,
				},
				{ provide: PokemonsService, useFactory: mockPokemonsService },
				{ provide: UsersService, useFactory: mockUsersService },
			],
		}).compile();

		service = module.get<PokemonActionsService>(PokemonActionsService);
		actionsRepository = module.get(getRepositoryToken(PokemonAction));
		pokemonsService = module.get(PokemonsService);
		usersService = module.get(UsersService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	// ------------------------------------------------------------------ //
	describe('findAll', () => {
		it('deve retornar todas as ações quando usuário for enfermeira', async () => {
			const actions = [mockAction(), mockAction(ActionType.FEED)];
			actionsRepository.find.mockResolvedValue(actions);

			const result = await service.findAll('nurse-uuid', true);

			expect(result).toEqual(actions);

			// Enfermeira não filtra por userId — where deve ser undefined
			expect(actionsRepository.find).toHaveBeenCalledWith({
				where: undefined,
				order: { createdAt: 'DESC' },
			});
		});

		it('deve retornar apenas as ações do treinador quando usuário for treinador', async () => {
			const actions = [mockAction()];
			actionsRepository.find.mockResolvedValue(actions);

			const result = await service.findAll('trainer-uuid', false);

			expect(result).toEqual(actions);

			// Treinador filtra apenas pelas suas próprias ações
			expect(actionsRepository.find).toHaveBeenCalledWith({
				where: { requestedBy: { id: 'trainer-uuid' } },
				order: { createdAt: 'DESC' },
			});
		});
	});

	// ------------------------------------------------------------------ //
	describe('requestAction', () => {
		it('deve criar uma solicitação de cura para o próprio pokémon', async () => {
			const trainer = mockTrainer();
			const pokemon = mockPokemon(trainer.id);
			const action = mockAction(ActionType.HEAL);

			pokemonsService.findOne.mockResolvedValue(pokemon);
			usersService.findById.mockResolvedValue(trainer);
			actionsRepository.findOne.mockResolvedValue(null); // sem pendente duplicado
			actionsRepository.create.mockReturnValue(action);
			actionsRepository.save.mockResolvedValue(action);

			const result = await service.requestAction(
				{ pokemonId: pokemon.id, type: ActionType.HEAL },
				trainer.id,
			);

			expect(result).toEqual(action);
			expect(actionsRepository.save).toHaveBeenCalled();
		});

		it('deve criar uma solicitação de alimentação para o próprio pokémon', async () => {
			const trainer = mockTrainer();
			const pokemon = mockPokemon(trainer.id);
			const action = mockAction(ActionType.FEED);

			pokemonsService.findOne.mockResolvedValue(pokemon);
			usersService.findById.mockResolvedValue(trainer);
			actionsRepository.findOne.mockResolvedValue(null);
			actionsRepository.create.mockReturnValue(action);
			actionsRepository.save.mockResolvedValue(action);

			const result = await service.requestAction(
				{ pokemonId: pokemon.id, type: ActionType.FEED },
				trainer.id,
			);

			expect(result).toEqual(action);
		});

		it('deve incluir a observação do treinador quando informada', async () => {
			const trainer = mockTrainer();
			const pokemon = mockPokemon(trainer.id);
			const action = { ...mockAction(), trainerNote: 'Pikachu foi envenenado!' };

			pokemonsService.findOne.mockResolvedValue(pokemon);
			usersService.findById.mockResolvedValue(trainer);
			actionsRepository.findOne.mockResolvedValue(null);
			actionsRepository.create.mockReturnValue(action);
			actionsRepository.save.mockResolvedValue(action);

			const result = await service.requestAction(
				{
					pokemonId: pokemon.id,
					type: ActionType.HEAL,
					trainerNote: 'Pikachu foi envenenado!',
				},
				trainer.id,
			);

			expect(result.trainerNote).toBe('Pikachu foi envenenado!');
		});

		it('deve lançar ForbiddenException ao solicitar ação para pokémon de outro treinador', async () => {
			const trainer = mockTrainer();

			// Pokémon pertence a outro treinador
			const pokemon = mockPokemon('outro-trainer-uuid');

			pokemonsService.findOne.mockResolvedValue(pokemon);
			usersService.findById.mockResolvedValue(trainer);

			await expect(
				service.requestAction(
					{ pokemonId: pokemon.id, type: ActionType.HEAL },
					trainer.id,
				),
			).rejects.toThrow(ForbiddenException);

			// Garante que nenhuma ação foi salva
			expect(actionsRepository.save).not.toHaveBeenCalled();
		});

		it('deve lançar BadRequestException quando já existe solicitação de cura pendente', async () => {
			const trainer = mockTrainer();
			const pokemon = mockPokemon(trainer.id);
			const existingAction = mockAction(ActionType.HEAL, ActionStatus.PENDING);

			pokemonsService.findOne.mockResolvedValue(pokemon);
			usersService.findById.mockResolvedValue(trainer);

			// Simula solicitação de cura já pendente
			actionsRepository.findOne.mockResolvedValue(existingAction);

			await expect(
				service.requestAction(
					{ pokemonId: pokemon.id, type: ActionType.HEAL },
					trainer.id,
				),
			).rejects.toThrow(BadRequestException);

			expect(actionsRepository.save).not.toHaveBeenCalled();
		});

		it('deve lançar BadRequestException quando já existe solicitação de alimentação pendente', async () => {
			const trainer = mockTrainer();
			const pokemon = mockPokemon(trainer.id);
			const existingAction = mockAction(ActionType.FEED, ActionStatus.PENDING);

			pokemonsService.findOne.mockResolvedValue(pokemon);
			usersService.findById.mockResolvedValue(trainer);
			actionsRepository.findOne.mockResolvedValue(existingAction);

			await expect(
				service.requestAction(
					{ pokemonId: pokemon.id, type: ActionType.FEED },
					trainer.id,
				),
			).rejects.toThrow(BadRequestException);
		});

		it('deve permitir solicitação de alimentação mesmo com cura pendente', async () => {
			const trainer = mockTrainer();
			const pokemon = mockPokemon(trainer.id);
			const feedAction = mockAction(ActionType.FEED);

			pokemonsService.findOne.mockResolvedValue(pokemon);
			usersService.findById.mockResolvedValue(trainer);

			// Não há alimentação pendente, apenas cura
			actionsRepository.findOne.mockResolvedValue(null);
			actionsRepository.create.mockReturnValue(feedAction);
			actionsRepository.save.mockResolvedValue(feedAction);

			const result = await service.requestAction(
				{ pokemonId: pokemon.id, type: ActionType.FEED },
				trainer.id,
			);

			expect(result).toEqual(feedAction);
		});
	});

	// ------------------------------------------------------------------ //
	describe('reviewAction', () => {
		it('deve aprovar uma solicitação de cura e curar o pokémon', async () => {
			const action = mockAction(ActionType.HEAL, ActionStatus.PENDING);
			const nurse = mockNurse();
			const approvedAction = {
				...action,
				status: ActionStatus.APPROVED,
				reviewedBy: nurse,
			};

			actionsRepository.findOne.mockResolvedValue(action);
			usersService.findById.mockResolvedValue(nurse);
			pokemonsService.update.mockResolvedValue(mockPokemon());
			actionsRepository.save.mockResolvedValue(approvedAction);

			const result = await service.reviewAction(
				action.id,
				{ status: ActionStatus.APPROVED },
				nurse.id,
			);

			expect(result.status).toBe(ActionStatus.APPROVED);
			expect(result.reviewedBy).toEqual(nurse);

			// Garante que o pokémon foi curado com HP máximo e status saudável
			expect(pokemonsService.update).toHaveBeenCalledWith(
				action.pokemon.id,
				{ hp: 255, healthStatus: PokemonStatus.HEALTHY },
				action.pokemon.createdBy.id,
			);
		});

		it('deve recusar uma solicitação sem alterar o pokémon', async () => {
			const action = mockAction(ActionType.HEAL, ActionStatus.PENDING);
			const nurse = mockNurse();
			const rejectedAction = {
				...action,
				status: ActionStatus.REJECTED,
				reviewedBy: nurse,
				nurseNote: 'Pokémon está saudável, não precisa de cura.',
			};

			actionsRepository.findOne.mockResolvedValue(action);
			usersService.findById.mockResolvedValue(nurse);
			actionsRepository.save.mockResolvedValue(rejectedAction);

			const result = await service.reviewAction(
				action.id,
				{
					status: ActionStatus.REJECTED,
					nurseNote: 'Pokémon está saudável, não precisa de cura.',
				},
				nurse.id,
			);

			expect(result.status).toBe(ActionStatus.REJECTED);

			// Garante que o pokémon NÃO foi alterado ao recusar
			expect(pokemonsService.update).not.toHaveBeenCalled();
		});

		it('deve registrar o nome da enfermeira que revisou a solicitação', async () => {
			const action = mockAction(ActionType.HEAL, ActionStatus.PENDING);
			const nurse = mockNurse();
			const approvedAction = { ...action, status: ActionStatus.APPROVED, reviewedBy: nurse };

			actionsRepository.findOne.mockResolvedValue(action);
			usersService.findById.mockResolvedValue(nurse);
			pokemonsService.update.mockResolvedValue(mockPokemon());
			actionsRepository.save.mockResolvedValue(approvedAction);

			const result = await service.reviewAction(
				action.id,
				{ status: ActionStatus.APPROVED },
				nurse.id,
			);

			expect(result.reviewedBy).toEqual(nurse);
			expect(result.reviewedBy?.name).toBe('Enfermeira Joy');
		});

		it('deve salvar a observação da enfermeira ao revisar', async () => {
			const action = mockAction(ActionType.HEAL, ActionStatus.PENDING);
			const nurse = mockNurse();
			const nurseNote = 'Pikachu curado com antídoto!';
			const approvedAction = { ...action, status: ActionStatus.APPROVED, nurseNote };

			actionsRepository.findOne.mockResolvedValue(action);
			usersService.findById.mockResolvedValue(nurse);
			pokemonsService.update.mockResolvedValue(mockPokemon());
			actionsRepository.save.mockResolvedValue(approvedAction);

			const result = await service.reviewAction(
				action.id,
				{ status: ActionStatus.APPROVED, nurseNote },
				nurse.id,
			);

			expect(result.nurseNote).toBe(nurseNote);
		});

		it('deve aprovar uma solicitação de alimentação sem alterar status de saúde', async () => {
			const action = mockAction(ActionType.FEED, ActionStatus.PENDING);
			const nurse = mockNurse();
			const approvedAction = { ...action, status: ActionStatus.APPROVED, reviewedBy: nurse };

			actionsRepository.findOne.mockResolvedValue(action);
			usersService.findById.mockResolvedValue(nurse);
			actionsRepository.save.mockResolvedValue(approvedAction);

			const result = await service.reviewAction(
				action.id,
				{ status: ActionStatus.APPROVED },
				nurse.id,
			);

			expect(result.status).toBe(ActionStatus.APPROVED);

			// Alimentação não altera o pokémon por enquanto
			expect(pokemonsService.update).not.toHaveBeenCalled();
		});

		it('deve lançar NotFoundException quando solicitação não existe', async () => {
			actionsRepository.findOne.mockResolvedValue(null);

			await expect(
				service.reviewAction(
					'uuid-inexistente',
					{ status: ActionStatus.APPROVED },
					'nurse-uuid',
				),
			).rejects.toThrow(NotFoundException);
		});

		it('deve lançar BadRequestException ao revisar solicitação já aprovada', async () => {
			const alreadyApproved = mockAction(ActionType.HEAL, ActionStatus.APPROVED);
			actionsRepository.findOne.mockResolvedValue(alreadyApproved);

			await expect(
				service.reviewAction(
					alreadyApproved.id,
					{ status: ActionStatus.APPROVED },
					'nurse-uuid',
				),
			).rejects.toThrow(BadRequestException);

			expect(actionsRepository.save).not.toHaveBeenCalled();
		});

		it('deve lançar BadRequestException ao revisar solicitação já recusada', async () => {
			// Solicitação já foi recusada anteriormente
			const alreadyRejected = mockAction(ActionType.HEAL, ActionStatus.REJECTED);
			actionsRepository.findOne.mockResolvedValue(alreadyRejected);

			await expect(
				service.reviewAction(
					alreadyRejected.id,
					{ status: ActionStatus.REJECTED },
					'nurse-uuid',
				),
			).rejects.toThrow(BadRequestException);
		});
	});
});