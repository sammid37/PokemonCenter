import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pokemon } from './entities/pokemon.entity';
import { PokemonsService } from './pokemons.service';
import { PokemonsController } from './pokemons.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pokemon]),
    UsersModule,
  ],
  providers: [PokemonsService],
  controllers: [PokemonsController],
})
export class PokemonsModule {}