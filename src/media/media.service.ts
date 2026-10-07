import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import 'multer';
import axios from 'axios';
import FormData from 'form-data';

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

      const publicUrl = process.env.R2_PUBLIC_DOMAIN || process.env.R2_PUBLIC_URL || '';
      return `${publicUrl.replace(/\/$/, '')}/${key}`;
    } catch (error: any) {
      console.error('R2 Upload Error Details:', error);
      throw new InternalServerErrorException(`R2 Upload Failed: ${error.message || 'Unknown error'}`);
    }
  }

  async uploadVideo(file: Express.Multer.File): Promise<{ success: boolean; uid: string; preview: string; type: string }> {
    const accountId = process.env.CF_ACCOUNT_ID;
    const apiToken = process.env.CF_STREAM_API_TOKEN;

    if (!accountId || !apiToken) {
      throw new InternalServerErrorException('Cloudflare Stream credentials are not configured');
    }

    try {
      const formData = new FormData();
      formData.append('file', file.buffer, file.originalname);

      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            ...formData.getHeaders(),
          },
        }
      );

      const result = response.data.result;

      return {
        success: true,
        uid: result.uid,
        preview: result.preview,
        type: 'video',
      };
    } catch (error: any) {
      const errorDetails = error.response?.data || error.message;
      console.error('Cloudflare Stream Upload Error Details:', errorDetails);
      
      const errorMessage = error.response?.data?.errors?.[0]?.message || error.message || 'Unknown error';
      throw new InternalServerErrorException(`Video Upload Failed: ${errorMessage}`);
    }
  }
}
