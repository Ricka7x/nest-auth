import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VerificationTokenModule } from './verification-token/verification-token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    AccountsModule,
    VerificationTokenModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
