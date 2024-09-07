import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StripeWebhookController } from '../stripe/stripe-webhook.controller';
import { StripeService } from '../stripe/stripe.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  providers: [SubscriptionService, StripeService, PrismaService],
  controllers: [SubscriptionController, StripeWebhookController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
