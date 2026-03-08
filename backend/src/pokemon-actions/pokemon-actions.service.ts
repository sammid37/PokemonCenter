import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PokemonAction } from './entities/pokemon-action.entity';
import { RequestActionDto } from './dto/request-action.dto';
import { ReviewActionDto } from './dto/review-action.dto';
import { PokemonsService } from '../pokemons/pokemons.service';
import { UsersService } from '../users/users.service';
import { ActionStatus } from './enums/action-status.enum';
import { ActionType } from './enums/action-type.enum';
import { PokemonStatus } from '../pokemons/enums/pokemon-status.enum';

@Injectable()
export class PokemonActionsService {
  constructor(
    @InjectRepository(PokemonAction)
    private readonly actionsRepository: Repository<PokemonAction>,
    private readonly pokemonsService: PokemonsService,
    private readonly usersService: UsersService,
  ) {}

  // Lista todas as ações (Enfermeira Joy vê todas, treinador vê apenas as suas)
  async findAll(userId: string, isNurse: boolean): Promise<PokemonAction[]> {
    return this.actionsRepository.find({
      where: isNurse ? undefined : { requestedBy: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async requestAction(dto: RequestActionDto, userId: string): Promise<PokemonAction> {
    const pokemon = await this.pokemonsService.findOne(dto.pokemonId);
    const user = await this.usersService.findById(userId);

    if (pokemon.createdBy.id !== userId) {
      throw new ForbiddenException(
        'Você só pode solicitar ações para seus próprios pokémons',
      );
    }

    // Verifica se já existe uma ação pendente do mesmo tipo para o pokémon
    const existingPending = await this.actionsRepository.findOne({
      where: {
        pokemon: { id: dto.pokemonId },
        type: dto.type,
        status: ActionStatus.PENDING,
      },
    });

    if (existingPending) {
      throw new BadRequestException(
        `Já existe uma solicitação de ${dto.type === ActionType.HEAL ? 'cura' : 'alimentação'} pendente para este pokémon`,
      );
    }

    const action = this.actionsRepository.create({
      pokemon,
      requestedBy: user,
      type: dto.type,
      trainerNote: dto.trainerNote ?? null,
      reviewedBy: null,
    });

    return this.actionsRepository.save(action);
  }

  // Enfermeira Joy aprova ou recusa uma ação
  async reviewAction(
    actionId: string,
    dto: ReviewActionDto,
    nurseId: string,
  ): Promise<PokemonAction> {
    const action = await this.actionsRepository.findOne({
      where: { id: actionId },
    });

    if (!action) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    // Não permite revisar uma ação que já foi revisada
    if (action.status !== ActionStatus.PENDING) {
      throw new BadRequestException(
        'Esta solicitação já foi revisada e não pode ser alterada',
      );
    }

    const nurse = await this.usersService.findById(nurseId);

    action.status = dto.status;
    action.nurseNote = dto.nurseNote ?? null;
    action.reviewedBy = nurse;

    if (dto.status === ActionStatus.APPROVED) {
      await this.applyActionEffect(action);
    }

    return this.actionsRepository.save(action);
  }

  private async applyActionEffect(action: PokemonAction): Promise<void> {
    if (action.type === ActionType.HEAL) {
      // Cura o pokémon — restaura HP máximo e remove status negativos
      await this.pokemonsService.update(
        action.pokemon.id,
        {
          hp: 255,
          healthStatus: PokemonStatus.HEALTHY,
        },
        action.pokemon.createdBy.id,
      );
    }

    // A alimentação não altera campos por enquanto
    // pode ser expandida futuramente (ex: aumentar nível ou HP)
  }
}