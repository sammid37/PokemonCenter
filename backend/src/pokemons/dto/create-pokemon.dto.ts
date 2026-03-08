import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
  ArrayMinSize,
  ArrayMaxSize,
  Min,
} from 'class-validator';
import { PokemonType } from '../enums/pokemon-type.enum';

export class CreatePokemonDto {
  @ApiProperty({ example: 'Pikachu' })
  @IsString()
  name: string;

  @ApiProperty({
    example: ['Electric'],
    enum: PokemonType,
    isArray: true,
    description: 'Mínimo 1 e máximo 2 tipos',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'O pokémon deve ter pelo menos 1 tipo' })
  @ArrayMaxSize(2, { message: 'O pokémon pode ter no máximo 2 tipos' })
  @IsEnum(PokemonType, {
    each: true, // valida cada item do array individualmente
    message: `Tipo inválido. Os tipos aceitos são: ${Object.values(PokemonType).join(', ')}`,
  })
  types: PokemonType[];

  @ApiProperty({ example: 25 })
  @IsNumber()
  @IsPositive()
  level: number;

  @ApiProperty({ example: 35 })
  @IsNumber()
  @IsPositive()
  hp: number;

  @ApiProperty({ example: 25, description: 'Número oficial da Pokédex' })
  @IsNumber()
  @Min(1)
  pokedexNumber: number;
}