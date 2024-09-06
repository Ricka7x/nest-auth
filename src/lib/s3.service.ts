import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly config: ConfigService) {
    this.s3Client = new S3Client({
      region: this.config.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = this.config.get<string>('AWS_S3_BUCKET_NAME');
  }

  /**
   * Uploads a file to S3
   * @param file - Buffer of the file to upload
   * @param mimetype - MIME type of the file
   * @returns URL of the uploaded file
   */
  async uploadFile(file: Buffer, mimetype: string): Promise<string> {
    const key = `${uuid()}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: mimetype,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File uploaded successfully. Key: ${key}`);
      return this.getFileUrl(key);
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Gets a file from S3 by its key
   * @param key - The key of the file in the S3 bucket
   * @returns A stream of the file content
   */
  async getFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      return new Promise((resolve, reject) => {
        const chunks = [];
        response.Body.on('data', (chunk) => chunks.push(chunk));
        response.Body.on('end', () => resolve(Buffer.concat(chunks)));
        response.Body.on('error', reject);
      });
    } catch (error) {
      this.logger.error('Error retrieving file:', error);
      throw error;
    }
  }

  /**
   * Deletes a file from S3 by its key
   * @param key - The key of the file in the S3 bucket
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully. Key: ${key}`);
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Constructs the S3 file URL for a given key
   * @param key - The key of the file in the S3 bucket
   * @returns The URL of the file
   */
  private getFileUrl(key: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }
}
