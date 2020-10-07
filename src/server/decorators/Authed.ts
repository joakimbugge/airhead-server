import { createParamDecorator } from '@nestjs/common';
import { CustomParamFactory } from '@nestjs/common/interfaces';
import { Request } from 'express';
import { User } from '../../modules/user/domain/User';

export const Authed = createParamDecorator((data: CustomParamFactory, req: Request): User => req.user as User);
