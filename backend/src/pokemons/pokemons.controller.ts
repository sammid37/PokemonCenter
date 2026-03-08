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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@ApiTags('Pokémons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pokemons')
export class PokemonsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pokémons' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso' })
  findAll(@Request() req) {
    const isNurse = req.user.role === UserRole.NURSE;
    return this.pokemonsService.findAll(isNurse ? undefined : req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um pokémon pelo ID' })
  @ApiResponse({ status: 200, description: 'Pokémon encontrado' })
  @ApiResponse({ status: 404, description: 'Pokémon não encontrado' })
  findOne(@Param('id') id: string) {
    return this.pokemonsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.TRAINER)
  @ApiOperation({ summary: 'Cadastrar novo pokémon' })
  @ApiResponse({ status: 201, description: 'Pokémon cadastrado com sucesso' })
  @ApiResponse({ status: 403, description: 'Apenas treinadores podem cadastrar pokémons' })
  create(@Body() dto: CreatePokemonDto, @Request() req) {
    return this.pokemonsService.create(dto, req.user.id);
  }

  @Put(':id')
  @Roles(UserRole.TRAINER)
  @ApiOperation({ summary: 'Atualizar pokémon (apenas o dono pode editar)' })
  @ApiResponse({ status: 200, description: 'Pokémon atualizado com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para editar este pokémon' })
  update(@Param('id') id: string, @Body() dto: UpdatePokemonDto, @Request() req) {
    return this.pokemonsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.TRAINER)
  @ApiOperation({ summary: 'Excluir pokémon (apenas o dono pode excluir)' })
  @ApiResponse({ status: 200, description: 'Pokémon excluído com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para excluir este pokémon' })
  remove(@Param('id') id: string, @Request() req) {
    return this.pokemonsService.remove(id, req.user.id);
  }
}