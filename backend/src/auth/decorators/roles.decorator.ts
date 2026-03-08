import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/enums/user-role.enum';

export const ROLES_KEY = 'roles';

// Decorator para definir os roles permitidos em uma rota
// Exemplo de uso: @Roles(UserRole.NURSE)
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);