import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor() {}

  sendEmail(to: string, body: string, subject: string) {
    // implementation to send email
    console.log(
      'Email sent to ' + to + ' with subject: ' + subject + 'content' + body,
    );
  }
}
