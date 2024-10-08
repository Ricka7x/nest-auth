import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { EmailMagicLinkGuard } from './guards/email-magic-link.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async register(@Body() signupDto: SignupDto) {
    return this.authService.register(signupDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Request() req) {
    // This route will redirect to Google for authentication
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(@Request() req) {
    return req.user;
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async githubAuth(@Request() req) {
    // This route will redirect to Google for authentication
  }

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  githubAuthCallback(@Request() req) {
    return req.user;
  }

  @Post('email-magic-link')
  async magicLinkAuth(@Body('email') email: string) {
    await this.authService.sendMagicLink(email);
    return { message: 'Magic link sent to your email' };
  }

  @Get('email-magic-link/verify')
  @UseGuards(EmailMagicLinkGuard)
  async magicLinkAuthVerify(@Request() req) {
    return req.user;
  }
}
