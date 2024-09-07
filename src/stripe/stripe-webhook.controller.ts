import { Controller, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { SubscriptionService } from '../subscription/subscription.service';
import { StripeService } from './stripe.service';

@Controller('stripe-webhook')
export class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Post()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    const signature = req.headers['stripe-signature'] as string;

    try {
      const event = this.stripeService.constructEventFromPayload(
        req.rawBody,
        signature,
      );

      // Handle the event
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as any;
          await this.subscriptionService.updateSubscriptionStatus(
            subscription.id,
            subscription.status,
            new Date(subscription.current_period_end * 1000),
          );
          break;
        case 'invoice.paid':
          // Handle successful payment
          const invoice = event.data.object as any;
          await this.subscriptionService.handleSuccessfulPayment(invoice);
          break;
        case 'invoice.payment_failed':
          // Handle failed payment
          const failedInvoice = event.data.object as any;
          await this.subscriptionService.handleFailedPayment(failedInvoice);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (err) {
      console.error(err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
