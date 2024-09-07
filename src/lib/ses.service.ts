import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SendBulkTemplatedEmailCommand,
  SendBulkTemplatedEmailCommandInput,
  SendEmailCommand,
  SESClient,
} from '@aws-sdk/client-ses';

@Injectable()
export class SesService {
  private readonly logger = new Logger(SesService.name);
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

  /**
   * Sends an email using AWS SES
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param body - Email body (can be HTML or plain text)
   */
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

  /**
   * Sends bulk emails to multiple recipients using AWS SES
   * @param recipients - List of recipient objects with email and personalization data
   * @param templateName - The name of the SES template to use for this email
   * @param defaultTemplateData - Default data to fill in the template for all recipients
   */
  async sendBulkEmails(
    recipients: { email: string; replacements: Record<string, string> }[],
    templateName: string,
    defaultTemplateData?: Record<string, string>,
  ): Promise<void> {
    const bulkEmailEntries = recipients.map((recipient) => ({
      Destination: {
        ToAddresses: [recipient.email],
      },
      ReplacementTemplateData: JSON.stringify(recipient.replacements), // Custom data per recipient
    }));

    const params: SendBulkTemplatedEmailCommandInput = {
      Source: this.config.get<string>('AWS_SES_FROM_EMAIL'),
      Template: templateName,
      DefaultTemplateData: JSON.stringify(defaultTemplateData || {}),
      Destinations: bulkEmailEntries,
    };

    const command = new SendBulkTemplatedEmailCommand(params);

    try {
      const result = await this.sesClient.send(command);
      this.logger.log(
        `Bulk email sent successfully to multiple recipients`,
        result,
      );
    } catch (error) {
      this.logger.error('Failed to send bulk emails', error);
      throw error;
    }
  }
}
