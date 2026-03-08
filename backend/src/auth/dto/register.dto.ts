import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
	@IsString()
	name: string;

	@IsEmail({}, { message: 'E-mail inválido' })
	email: string;

	@IsString()
	@MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
	password: string;
}
