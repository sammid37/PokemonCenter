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
  IsOptional,
} from 'class-validator';
import { PokemonType } from '../enums/pokemon-type.enum';
import { PokemonGender } from '../enums/pokemon-gender.enum';
import { PokemonStatus } from '../enums/pokemon-status.enum';

export class CreatePokemonDto {
  @ApiProperty({ example: 'Pikachu' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Pipi',
    description: 'Apelido dado pelo treinador (opcional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  nickname?: string;
  
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
  
  @ApiProperty({ example: 0.4, description: 'Altura em metros' })
  @IsNumber()
  @IsPositive()
  height: number;

  @ApiProperty({ example: 6.0, description: 'Peso em quilogramas' })
  @IsNumber()
  @IsPositive()
  weight: number;

  @ApiProperty({ enum: PokemonGender, example: PokemonGender.MALE })
  @IsEnum(PokemonGender, { message: 'Sexo inválido. Use Male ou Female' })
  gender: PokemonGender;

  @ApiProperty({
    enum: PokemonStatus,
    example: PokemonStatus.HEALTHY,
    description: 'Status de saúde do pokémon — padrão: Healthy',
    required: false,
  })
  @IsEnum(PokemonStatus, { message: 'Status de saúde inválido' })
  @IsOptional()
  healthStatus?: PokemonStatus;
}