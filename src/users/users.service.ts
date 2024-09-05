import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '../prisma.service';
import { BaseCrudService } from '../common/base-crud-service';

@Injectable()
export class UsersService extends BaseCrudService<User> {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }
}
