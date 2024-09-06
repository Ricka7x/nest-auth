import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccountsModule } from 'src/accounts/accounts.module';
import { AccountsService } from 'src/accounts/accounts.service';
import { EmailService } from 'src/email.service';
import { PrismaService } from 'src/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from './../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailMagicLinkStrategy } from './strategies/email-magic-link.strategy';
import { GitHubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule,
    AccountsModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '60s' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    AccountsService,
    PrismaService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    GitHubStrategy,
    EmailMagicLinkStrategy,
    EmailService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
