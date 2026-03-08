import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	UseGuards,
	Request,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { PokemonsService } from './pokemons.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Pokémons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pokemons')
export class PokemonsController {
	constructor(private readonly pokemonsService: PokemonsService) {}

	@Get()
	@ApiOperation({ summary: 'Listar todos os pokémons' })
	@ApiResponse({
		status: 200,
		description: 'Lista de pokémons retornada com sucesso',
	})
	findAll(@Request() req) {
		// TODO: depois validar se o tipo de usuário é do tipo treinador ou enfermeira Joy
		return this.pokemonsService.findAll(req.user.id);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Buscar um pokémon pelo ID' })
	@ApiResponse({ status: 200, description: 'Pokémon encontrado' })
	@ApiResponse({ status: 404, description: 'Pokémon não encontrado' })
	findOne(@Param('id') id: string) {
		return this.pokemonsService.findOne(id);
	}

	@Post()
	@ApiOperation({ summary: 'Cadastrar novo pokémon' })
	@ApiResponse({ status: 201, description: 'Pokémon cadastrado com sucesso' })
	@ApiResponse({ status: 400, description: 'Dados inválidos' })
	create(@Body() dto: CreatePokemonDto, @Request() req) {
		return this.pokemonsService.create(dto, req.user.id);
	}

	@Put(':id')
	@ApiOperation({ summary: 'Atualizar pokémon — apenas o dono pode editar' })
	@ApiResponse({ status: 200, description: 'Pokémon atualizado com sucesso' })
	@ApiResponse({
		status: 403,
		description: 'Sem permissão para editar este pokémon',
	})
	@ApiResponse({ status: 404, description: 'Pokémon não encontrado' })
	update(
		@Param('id') id: string,
		@Body() dto: UpdatePokemonDto,
		@Request() req,
	) {
		return this.pokemonsService.update(id, dto, req.user.id);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Excluir pokémon — apenas o dono pode excluir' })
	@ApiResponse({ status: 200, description: 'Pokémon excluído com sucesso' })
	@ApiResponse({
		status: 403,
		description: 'Sem permissão para excluir este pokémon',
	})
	@ApiResponse({ status: 404, description: 'Pokémon não encontrado' })
	remove(@Param('id') id: string, @Request() req) {
		return this.pokemonsService.remove(id, req.user.id);
	}
}
