import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  async createSubscription(@Req() req, @Body('priceId') priceId: string) {
    const userId = req.user.id;
    return this.subscriptionService.createSubscription(userId, priceId);
  }

  @Delete()
  async cancelSubscription(@Req() req) {
    const userId = req.user.id;
    return this.subscriptionService.cancelSubscription(userId);
  }

  @Get()
  async getCurrentSubscription(@Req() req) {
    const userId = req.user.id;
    return this.subscriptionService.getCurrentSubscription(userId);
  }

  @Patch()
  async changeSubscription(@Req() req, @Body('newPriceId') newPriceId: string) {
    const userId = req.user.id;
    return this.subscriptionService.changeSubscription(userId, newPriceId);
  }

  @Get('kpis')
  async getSubscriptionKPIs() {
    return this.subscriptionService.getSubscriptionKPIs();
  }

  // Restoring previously existing methods

  @Post('webhook')
  async handleWebhook(@Req() req, @Body() body: any) {
    return this.subscriptionService.handleWebhook(body);
  }

  @Get('prices')
  async getSubscriptionPrices() {
    return this.subscriptionService.getSubscriptionPrices();
  }

  @Get('customer-portal')
  async createCustomerPortalSession(@Req() req) {
    const userId = req.user.id;
    return this.subscriptionService.createCustomerPortalSession(userId);
  }
}
