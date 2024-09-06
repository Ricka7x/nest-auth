import { Injectable } from '@nestjs/common';
import { VerificationToken } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud-service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class VerificationTokenService extends BaseCrudService<VerificationToken> {
  constructor(prisma: PrismaService) {
    super(prisma, 'verificationToken');
  }
}
