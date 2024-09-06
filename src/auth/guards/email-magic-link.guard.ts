import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class EmailMagicLinkGuard extends AuthGuard('email-magic-link') {}
