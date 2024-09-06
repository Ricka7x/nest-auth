import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from '../auth.service';

// Assume this service exists to interact with your Prisma models

@Injectable()
export class EmailMagicLinkStrategy extends PassportStrategy(
  Strategy,
  'email-magic-link',
) {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {
    super();
  }

  async validate(req: any): Promise<any> {
    const { token } = req.query;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Find the verification token
    const verificationToken = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (
      !verificationToken ||
      new Date(verificationToken.expires) < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Find or create the user
    let user = await this.prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email: verificationToken.identifier,
          emailVerified: new Date(),
        },
      });

      // Create an account for the user (you might want to adjust this based on your needs)
      await this.prisma.account.create({
        data: {
          userId: user.id,
          type: 'email',
          provider: 'email',
          providerAccountId: verificationToken.identifier,
        },
      });
    } else {
      // Update emailVerified if it wasn't set
      if (!user.emailVerified) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    }

    // Delete the used verification token
    await this.prisma.verificationToken.delete({
      where: { token },
    });

    //Create a token and return it
    const jwt = await this.authService.generateJwt(user);
    // Return the user object
    return jwt;
  }
}
