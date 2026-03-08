import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ActionType } from '../enums/action-type.enum';

export class RequestActionDto {
  @ApiProperty({ example: 'uuid-do-pokemon' })
  @IsUUID()
  pokemonId: string;

  @ApiProperty({ enum: ActionType, example: ActionType.HEAL })
  @IsEnum(ActionType)
  type: ActionType;

  @ApiProperty({
    example: 'Meu Pikachu foi envenenado na última batalha',
    required: false,
  })
  @IsString()
  @IsOptional()
  trainerNote?: string;
}