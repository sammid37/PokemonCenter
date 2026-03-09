import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../users/enums/user-role.enum';

export class RegisterDto {
	@IsString()
	name: string;

	@IsEmail({}, { message: 'E-mail inválido' })
	email: string;

	@IsString()
	@MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
	password: string;

  @ApiProperty({
		enum: UserRole,
    example: UserRole.TRAINER,
    required: false,
    description: 'Padrão: trainer',
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
