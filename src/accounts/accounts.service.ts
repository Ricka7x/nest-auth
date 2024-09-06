import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/client';
import { BaseCrudService } from '../common/base-crud-service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AccountsService extends BaseCrudService<Account> {
  constructor(prisma: PrismaService) {
    super(prisma, 'account');
  }

  async findByProviderAccountId(
    providerAccountId: string,
    provider: string,
  ): Promise<Account | null> {
    return this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
    });
  }
}
