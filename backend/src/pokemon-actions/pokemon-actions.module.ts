import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokemonAction } from './entities/pokemon-action.entity';
import { PokemonActionsService } from './pokemon-actions.service';
import { PokemonActionsController } from './pokemon-actions.controller';
import { PokemonsModule } from '../pokemons/pokemons.module';
import { UsersModule } from '../users/users.module';
import { PokemonsService } from '../pokemons/pokemons.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PokemonAction]),
    PokemonsModule,
    UsersModule,
  ],
  providers: [PokemonActionsService],
  controllers: [PokemonActionsController],
})

export class PokemonActionsModule {}