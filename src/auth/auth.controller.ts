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
  googleAuthRedirect(@Request() req) {
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
  githubAuthRedirect(@Request() req) {
    return req.user;
  }
}
