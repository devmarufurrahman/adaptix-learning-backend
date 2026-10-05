import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import 'multer';

@Injectable()
export class MediaService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.Endpoint_URL,
      credentials: {
        accessKeyId: process.env.Access_Key_ID as string,
        secretAccessKey: process.env.Secret_Access_Key as string,
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      const extension = extname(file.originalname);
      const key = `${folder}/${uuidv4()}${extension}`;

      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME as string,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const publicUrl = process.env.R2_PUBLIC_URL as string;
      return `${publicUrl.replace(/\/$/, '')}/${key}`;
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload file to R2');
    }
  }
}
