import {
  Controller,
  Get,
  Post,
  Patch,
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
import { PokemonActionsService } from './pokemon-actions.service';
import { RequestActionDto } from './dto/request-action.dto';
import { ReviewActionDto } from './dto/review-action.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@ApiTags('Ações de Cuidado')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pokemon-actions')
export class PokemonActionsController {
  constructor(private readonly actionsService: PokemonActionsService) {}

  // Ambos os roles podem listar (cada um vê o que lhe pertence)
  @Get()
  @ApiOperation({ summary: 'Listar solicitações de cuidado' })
  findAll(@Request() req) {
    const isNurse = req.user.role === UserRole.NURSE;
    return this.actionsService.findAll(req.user.id, isNurse);
  }

  // Apenas treinadores podem solicitar ações
  @Post()
  @Roles(UserRole.TRAINER)
  @ApiOperation({ summary: 'Solicitar cuidado para um pokémon' })
  @ApiResponse({ status: 201, description: 'Solicitação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Já existe solicitação pendente' })
  @ApiResponse({ status: 403, description: 'Pokémon não pertence ao treinador' })
  requestAction(@Body() dto: RequestActionDto, @Request() req) {
    return this.actionsService.requestAction(dto, req.user.id);
  }

  // Apenas Enfermeira Joy pode aprovar ou recusar
  @Patch(':id/review')
  @Roles(UserRole.NURSE)
  @ApiOperation({ summary: 'Aprovar ou recusar solicitação — apenas Enfermeira Joy' })
  @ApiResponse({ status: 200, description: 'Solicitação revisada com sucesso' })
  @ApiResponse({ status: 400, description: 'Solicitação já foi revisada' })
  @ApiResponse({ status: 403, description: 'Apenas a Enfermeira Joy pode revisar' })
  reviewAction(
    @Param('id') id: string,
    @Body() dto: ReviewActionDto,
    @Request() req,
  ) {
    return this.actionsService.reviewAction(id, dto, req.user.id);
  }
}