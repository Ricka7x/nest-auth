import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { EmailService } from 'src/email.service';
import { PrismaService } from 'src/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private config: ConfigService,
  ) {}

  async generateJwt(user: any) {
    const payload = { id: user.id, email: user.email };
    return {
      jwt: this.jwtService.sign(payload),
    };
  }

  async register(signupDto: SignupDto) {
    const { email, password, name } = signupDto;

    // Check if the user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER', // Default role
      },
    });

    return newUser;
  }

  async login(user: any) {
    const jwt = this.generateJwt(user);
    return {
      access_token: jwt,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async sendMagicLink(email: string) {
    const token = uuidv4();

    const expires = new Date(Date.now() + 3600000); // 1 hour from now
    console.log({ token, email, expires });

    const verificationToken = await this.prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    const appUrl = this.config.get('APP_URL');

    const emailBody = `
    
    Click to verify your account

    ${appUrl}/auth/email-magic-link/verify?token=${verificationToken.token}
    `;
    const subject = 'Email Verification Link';

    await this.emailService.sendEmail(email, emailBody, subject);
  }
}
