import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { PokemonsModule } from './pokemons/pokemons.module';
import { Pokemon } from './pokemons/entities/pokemon.entity';
import { PokemonAction } from './pokemon-actions/entities/pokemon-action.entity';
import { PokemonActionsModule } from './pokemon-actions/pokemon-actions.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('DB_HOST'),
				port: configService.get<number>('DB_PORT'),
				username: configService.get('DB_USERNAME'),
				password: configService.get('DB_PASSWORD'),
				database: configService.get('DB_NAME'),
				entities: [User, Pokemon, PokemonAction],
				// TODO: quando estiver em produção, trocar por false e utilizar migrations
				synchronize: true,
			}),
			inject: [ConfigService],
		}),
		AuthModule,
		UsersModule,
		PokemonsModule,
    PokemonActionsModule,
	],
})
export class AppModule {}
