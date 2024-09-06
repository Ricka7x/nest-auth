import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AccountsService } from 'src/accounts/accounts.service';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private accountsService: AccountsService, // Add AccountsService for account management
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos, provider } = profile;
    const email = emails[0].value;

    // Check if the user already exists
    let user = await this.usersService.findByEmail(email);

    // If the user does not exist, create a new user
    if (!user) {
      user = await this.usersService.create({
        email,
        name: name.givenName + ' ' + name.familyName,
        image: photos[0].value,
      });
    }

    // Check if the account with the Google provider exists
    let account = await this.accountsService.findByProviderAccountId(
      id,
      provider,
    );

    // If the account doesn't exist, create a new account
    if (!account) {
      account = await this.accountsService.create({
        userId: user.id,
        provider,
        type: 'oauth',
        providerAccountId: id,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: null, // Handle this based on your use case
      });
    }

    const jwt = this.authService.generateJwt(user);

    done(null, jwt);
  }
}
