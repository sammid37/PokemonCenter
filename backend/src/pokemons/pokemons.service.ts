import {
	Injectable,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pokemon } from './entities/pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class PokemonsService {
	constructor(
		@InjectRepository(Pokemon)
		private readonly pokemonsRepository: Repository<Pokemon>,
		private readonly usersService: UsersService,
	) {}

	async findAll(userId?: string): Promise<Pokemon[]> {
		return this.pokemonsRepository.find({
			where: userId ? { createdBy: { id: userId } } : undefined,
		});
	}

	async findOne(id: string): Promise<Pokemon> {
		const pokemon = await this.pokemonsRepository.findOne({ where: { id } });

		if (!pokemon) {
			throw new NotFoundException(`Pokémon com id ${id} não encontrado`);
		}

		return pokemon;
	}

	async create(dto: CreatePokemonDto, userId: string): Promise<Pokemon> {
		const user = await this.usersService.findById(userId);

		const pokemon = this.pokemonsRepository.create({
			...dto,
			createdBy: user,
		});

		return this.pokemonsRepository.save(pokemon);
	}

	async update(
		id: string,
		dto: UpdatePokemonDto,
		user: string,
	): Promise<Pokemon> {
		const pokemon = await this.findOne(id);

		if (pokemon.createdBy.id !== user) {
			throw new ForbiddenException(
				'Você não tem permissão para editar este pokémon',
			);
		}

		Object.assign(pokemon, dto);
		return this.pokemonsRepository.save(pokemon);
	}

	async remove(id: string, user: string): Promise<void> {
		const pokemon = await this.findOne(id);

		if (pokemon.createdBy.id !== user) {
			throw new ForbiddenException(
				'Você não tem permissão para excluir este pokémon',
			);
		}

		await this.pokemonsRepository.remove(pokemon);
	}
}
