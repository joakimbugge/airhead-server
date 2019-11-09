import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../../modules/user/enums/UserRole';
import { RoleGuard } from '../guards/RoleGuard';

export function Authenticated(role: UserRole = UserRole.User) {
  return UseGuards(AuthGuard('jwt'), new RoleGuard(role));
}
