import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { PrismaService } from '../prisma.service';
import { StripeWebhookController } from '../stripe/stripe-webhook.controller';
import { StripeService } from '../stripe/stripe.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [EmailModule],
  providers: [SubscriptionService, StripeService, PrismaService],
  controllers: [SubscriptionController, StripeWebhookController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
