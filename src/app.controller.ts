import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  //TODO: protect this route in the future
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // File upload logic
    console.log(file);
    return 'File uploaded successfully';
  }

  @Post('uploads')
  @UseInterceptors(FileInterceptor('files'))
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    // File upload logic
    console.log(files);
    return 'Files uploaded successfully';
  }

  //Example of passing more data along the file

  // @UseInterceptors(FileInterceptor('file'))
  // @Post('file')
  // uploadFile(
  //   @Body() body: SampleDto,
  //   @UploadedFile() file: Express.Multer.File,
  // ) {
  //   return {
  //     body,
  //     file: file.buffer.toString(),
  //   };
  // }
}
