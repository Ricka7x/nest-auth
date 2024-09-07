import { Module } from '@nestjs/common';
import { AwsSesService } from './aws-ses.service';

@Module({
  providers: [
    {
      provide: 'EmailService',
      useClass: AwsSesService,
    },
  ],
  exports: ['EmailService'],
})
export class EmailModule {}
