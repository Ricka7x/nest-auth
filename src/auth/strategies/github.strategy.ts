import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AccountsService } from 'src/accounts/accounts.service';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
    private readonly accountsService: AccountsService,
    private readonly authService: AuthService, // Inject TokenService
  ) {
    super({
      clientID: config.get('GITHUB_CLIENT_ID'),
      clientSecret: config.get('GITHUB_CLIENT_SECRET'),
      callbackURL: config.get('GITHUB_CALLBACK_URL'),
      scope: ['user:email'], // Request additional scopes if needed
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { id, username, emails, photos } = profile;
    const email = emails[0].value;

    // Check if the user already exists
    let user = await this.usersService.findByEmail(email);

    // If the user does not exist, create a new user
    if (!user) {
      user = await this.usersService.create({
        email,
        name: username,
        image: photos[0].value,
      });
    }

    // Check if the account with the GitHub provider exists
    let account = await this.accountsService.findByProviderAccountId(
      id,
      'github',
    );

    // If the account doesn't exist, create a new account
    if (!account) {
      account = await this.accountsService.create({
        userId: user.id,
        provider: 'github',
        type: 'oauth',
        providerAccountId: id,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: null, // Handle this based on your token expiration logic
      });
    }

    // Generate a JWT for the authenticated user
    // Customize payload as needed
    const jwt = this.authService.generateJwt(user);

    // Return the token and user
    done(null, jwt);
  }
}
