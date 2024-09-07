import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EmailService } from '../email/email-service.interface';
import { PrismaService } from '../prisma.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    @Inject('EmailService') private readonly emailService: EmailService,
  ) {}

  async createSubscription(userId: string, priceId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await this.stripeService.createCustomer(
        user.email,
        user.name,
      );
      stripeCustomerId = customer.id;

      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    const subscription = await this.stripeService.createSubscription(
      stripeCustomerId,
      priceId,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000,
        ),
        subscriptionStatus: subscription.status,
      },
    });

    // Send a subscription confirmation email
    await this.emailService.sendEmail(
      user.email,
      'Subscription Confirmation',
      `Thank you for subscribing! Your subscription is now active.`,
    );

    return subscription;
  }

  async cancelSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.stripeSubscriptionId) {
      throw new NotFoundException('User or subscription not found');
    }

    const canceledSubscription = await this.stripeService.cancelSubscription(
      user.stripeSubscriptionId,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        subscriptionStatus: canceledSubscription.status,
      },
    });

    // Send a subscription cancellation email
    await this.emailService.sendEmail(
      user.email,
      'Subscription Cancelled',
      `Your subscription has been cancelled. We're sorry to see you go!`,
    );

    return canceledSubscription;
  }

  async getCurrentSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        stripeSubscriptionId: true,
        stripePriceId: true,
        subscriptionStatus: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user || !user.stripeSubscriptionId) {
      throw new NotFoundException('User or subscription not found');
    }

    const stripeSubscription = await this.stripeService.retrieveSubscription(
      user.stripeSubscriptionId,
    );

    return {
      id: stripeSubscription.id,
      status: stripeSubscription.status,
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      priceId: user.stripePriceId,
    };
  }

  async changeSubscription(userId: string, newPriceId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.stripeSubscriptionId) {
      throw new NotFoundException('User or subscription not found');
    }

    const updatedSubscription = await this.stripeService.updateSubscription(
      user.stripeSubscriptionId,
      newPriceId,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        stripePriceId: newPriceId,
        stripeCurrentPeriodEnd: new Date(
          updatedSubscription.current_period_end * 1000,
        ),
        subscriptionStatus: updatedSubscription.status,
      },
    });

    // Send a subscription change confirmation email
    await this.emailService.sendEmail(
      user.email,
      'Subscription Updated',
      `Your subscription has been updated. The changes will be reflected in your next billing cycle.`,
    );

    return updatedSubscription;
  }

  async updateSubscriptionStatus(
    subscriptionId: string,
    status: string,
    currentPeriodEnd: Date,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!user) {
      throw new NotFoundException('User with this subscription not found');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: status,
        stripeCurrentPeriodEnd: currentPeriodEnd,
      },
    });

    // Send an email notification about the subscription status change
    await this.emailService.sendEmail(
      user.email,
      'Subscription Status Update',
      `Your subscription status has been updated to: ${status}.`,
    );
  }

  async handleSuccessfulPayment(invoice: any) {
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: invoice.customer },
    });

    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastPaymentStatus: 'paid',
          lastPaymentDate: new Date(),
        },
      });

      // Send a payment success email
      await this.emailService.sendEmail(
        user.email,
        'Payment Successful',
        `Your payment of $${invoice.amount_paid / 100} has been successfully processed. Thank you for your subscription!`,
      );
    }
  }

  async handleFailedPayment(invoice: any) {
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: invoice.customer },
    });

    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastPaymentStatus: 'failed',
          lastPaymentDate: new Date(),
        },
      });

      // Send a payment failed email
      await this.emailService.sendEmail(
        user.email,
        'Payment Failed',
        `We were unable to process your payment of $${invoice.amount_due / 100}. Please update your payment method to continue your subscription.`,
      );
    }
  }

  async getSubscriptionKPIs() {
    const totalSubscribers = await this.prisma.user.count({
      where: { subscriptionStatus: 'active' },
    });

    const revenue = await this.stripeService.getTotalRevenue();

    const subscriptionsByTier = await this.prisma.user.groupBy({
      by: ['stripePriceId'],
      _count: {
        _all: true,
      },
      where: { subscriptionStatus: 'active' },
    });

    return {
      totalSubscribers,
      revenue,
      subscriptionsByTier,
    };
  }

  async handleWebhook(body: any) {
    console.log('Received webhook:', body);
    // Add your webhook handling logic here
  }

  async getSubscriptionPrices() {
    return this.stripeService.getSubscriptionPrices();
  }

  async createCustomerPortalSession(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.stripeCustomerId) {
      throw new NotFoundException('User or Stripe customer not found');
    }

    return this.stripeService.createCustomerPortalSession(
      user.stripeCustomerId,
    );
  }
}
