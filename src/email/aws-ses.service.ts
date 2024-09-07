import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { EmailService } from './email-service.interface';

@Injectable()
export class AwsSesService implements EmailService {
  private readonly logger = new Logger(AwsSesService.name);
  private readonly sesClient: SESClient;

  constructor(private readonly config: ConfigService) {
    this.sesClient = new SESClient({
      region: this.config.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const params = {
      Source: this.config.get<string>('AWS_SES_FROM_EMAIL'),
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Html: {
            Data: body,
          },
        },
      },
    };

    const command = new SendEmailCommand(params);

    try {
      const result = await this.sesClient.send(command);
      this.logger.log(`Email sent successfully to ${to}`, result);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }
}
