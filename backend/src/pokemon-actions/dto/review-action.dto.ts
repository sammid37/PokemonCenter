import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ActionStatus } from '../enums/action-status.enum';

export class ReviewActionDto {
  @ApiProperty({
    enum: [ActionStatus.APPROVED, ActionStatus.REJECTED],
    example: ActionStatus.APPROVED,
  })
  @IsEnum([ActionStatus.APPROVED, ActionStatus.REJECTED], {
    message: 'Status deve ser approved ou rejected',
  })
  status: ActionStatus.APPROVED | ActionStatus.REJECTED;

  @ApiProperty({
    example: 'Pokémon curado com sucesso!',
    required: false,
  })
  @IsString()
  @IsOptional()
  nurseNote?: string;
}