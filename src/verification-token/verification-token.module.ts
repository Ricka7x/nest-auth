import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { VerificationTokenController } from './verification-token.controller';
import { VerificationTokenService } from './verification-token.service';

@Module({
  controllers: [VerificationTokenController],
  providers: [VerificationTokenService, PrismaService],
})
export class VerificationTokenModule {}
