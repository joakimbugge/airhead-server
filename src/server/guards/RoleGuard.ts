import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../modules/user/domain/User';
import { UserRole } from '../../modules/user/enums/UserRole';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly role: UserRole) {
  }

  public canActivate(context: ExecutionContext): boolean {
    const user: User = context.switchToHttp().getRequest<Request>().user as User;
    return user.role >= this.role;
  }
}
