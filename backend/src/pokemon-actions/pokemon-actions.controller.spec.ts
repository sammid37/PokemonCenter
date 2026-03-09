import { Test, TestingModule } from '@nestjs/testing';
import { PokemonActionsController } from './pokemon-actions.controller';
import { PokemonActionsService } from './pokemon-actions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { ActionType } from './enums/action-type.enum';
import { ActionStatus } from './enums/action-status.enum';
import { PokemonStatus } from '../pokemons/enums/pokemon-status.enum';
import { PokemonAction } from './entities/pokemon-action.entity';
import { User } from '../users/entities/user.entity';
import { Pokemon } from '../pokemons/entities/pokemon.entity';

// ------------------------------------------------------------------ //
// Mocks
// ------------------------------------------------------------------ //

const mockPokemonActionsService = () => ({
	findAll: jest.fn(),
	requestAction: jest.fn(),
	reviewAction: jest.fn(),
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
	requestedBy: { id: 'trainer-uuid', name: 'Ash Ketchum' } as User,
	reviewedBy: null,
	createdAt: new Date(),
	updatedAt: new Date(),
});

describe('PokemonActionsController', () => {
	let controller: PokemonActionsController;
	let actionsService: jest.Mocked<PokemonActionsService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [PokemonActionsController],
			providers: [
				{ provide: PokemonActionsService, useFactory: mockPokemonActionsService },
			],
		})
			.overrideGuard(JwtAuthGuard)
			.useValue({ canActivate: () => true })
			.overrideGuard(RolesGuard)
			.useValue({ canActivate: () => true })
			.compile();

		controller = module.get<PokemonActionsController>(PokemonActionsController);
		actionsService = module.get(PokemonActionsService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	// ------------------------------------------------------------------ //
	describe('findAll', () => {
		it('deve retornar todas as ações quando usuário for enfermeira', async () => {
			const actions = [mockAction(), mockAction(ActionType.FEED)];
			actionsService.findAll.mockResolvedValue(actions);

			const result = await controller.findAll(mockNurseRequest());

			expect(result).toEqual(actions);

			// Enfermeira passa isNurse=true para ver todas as ações
			expect(actionsService.findAll).toHaveBeenCalledWith('nurse-uuid', true);
		});

		it('deve retornar apenas as ações do treinador quando usuário for treinador', async () => {
			const actions = [mockAction()];
			actionsService.findAll.mockResolvedValue(actions);

			const result = await controller.findAll(mockTrainerRequest());

			expect(result).toEqual(actions);

			// Treinador passa seu id e isNurse=false para filtrar apenas as suas ações
			expect(actionsService.findAll).toHaveBeenCalledWith('trainer-uuid', false);
		});
	});

	// ------------------------------------------------------------------ //
	describe('requestAction', () => {
		it('deve criar uma solicitação de cura para o treinador autenticado', async () => {
			const action = mockAction(ActionType.HEAL);
			const dto = { pokemonId: 'pokemon-uuid', type: ActionType.HEAL };

			actionsService.requestAction.mockResolvedValue(action);

			const result = await controller.requestAction(dto, mockTrainerRequest());

			expect(result).toEqual(action);

			// Garante que o id do treinador autenticado é passado ao service
			expect(actionsService.requestAction).toHaveBeenCalledWith(dto, 'trainer-uuid');
		});

		it('deve criar uma solicitação de alimentação para o treinador autenticado', async () => {
			const action = mockAction(ActionType.FEED);
			const dto = {
				pokemonId: 'pokemon-uuid',
				type: ActionType.FEED,
				trainerNote: 'Meu Pikachu está com fome!',
			};

			actionsService.requestAction.mockResolvedValue(action);

			const result = await controller.requestAction(dto, mockTrainerRequest());

			expect(result).toEqual(action);
			expect(actionsService.requestAction).toHaveBeenCalledWith(dto, 'trainer-uuid');
		});
	});

	// ------------------------------------------------------------------ //
	describe('reviewAction', () => {
		it('deve aprovar uma solicitação passando o id da enfermeira autenticada', async () => {
			const nurse = { id: 'nurse-uuid', name: 'Enfermeira Joy' } as User;
			const approvedAction = {
				...mockAction(ActionType.HEAL, ActionStatus.APPROVED),
				reviewedBy: nurse,
				nurseNote: 'Pikachu curado com sucesso!',
			};
			const dto = {
				status: ActionStatus.APPROVED as ActionStatus.APPROVED,
				nurseNote: 'Pikachu curado com sucesso!',
			};

			actionsService.reviewAction.mockResolvedValue(approvedAction);

			const result = await controller.reviewAction(
				'action-uuid',
				dto,
				mockNurseRequest(),
			);

			expect(result.status).toBe(ActionStatus.APPROVED);
			expect(result.reviewedBy).toEqual(nurse);

			// Garante que o service recebe o id da ação, o dto e o id da enfermeira
			expect(actionsService.reviewAction).toHaveBeenCalledWith(
				'action-uuid',
				dto,
				'nurse-uuid',
			);
		});

		it('deve recusar uma solicitação passando o id da enfermeira autenticada', async () => {
			const nurse = { id: 'nurse-uuid', name: 'Enfermeira Joy' } as User;
			const rejectedAction = {
				...mockAction(ActionType.HEAL, ActionStatus.REJECTED),
				reviewedBy: nurse,
				nurseNote: 'Pokémon está saudável, não precisa de cura.',
			};
			const dto = {
				status: ActionStatus.REJECTED as ActionStatus.REJECTED,
				nurseNote: 'Pokémon está saudável, não precisa de cura.',
			};

			actionsService.reviewAction.mockResolvedValue(rejectedAction);

			const result = await controller.reviewAction(
				'action-uuid',
				dto,
				mockNurseRequest(),
			);

			expect(result.status).toBe(ActionStatus.REJECTED);
			expect(result.reviewedBy).toEqual(nurse);
			expect(actionsService.reviewAction).toHaveBeenCalledWith(
				'action-uuid',
				dto,
				'nurse-uuid',
			);
		});

		it('deve registrar a observação da enfermeira ao revisar', async () => {
			const nurseNote = 'Charizard precisa de mais repouso.';
			const reviewedAction = {
				...mockAction(ActionType.HEAL, ActionStatus.REJECTED),
				nurseNote,
			};
			const dto = {
				status: ActionStatus.REJECTED as ActionStatus.REJECTED,
				nurseNote,
			};

			actionsService.reviewAction.mockResolvedValue(reviewedAction);

			const result = await controller.reviewAction(
				'action-uuid',
				dto,
				mockNurseRequest(),
			);

			expect(result.nurseNote).toBe(nurseNote);
		});
	});
});