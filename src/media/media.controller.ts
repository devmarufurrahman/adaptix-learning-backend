import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MediaService } from './media.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
import 'multer';

@ApiTags('Media')
@ApiBearerAuth('JWT-auth')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('MEDIA', 'CREATE')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file to R2 storage (Instructor/Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const uploadFolder = folder || 'general';
    const url = await this.mediaService.uploadFile(file, uploadFolder);

    return {
      success: true,
      url,
    };
  }

  @Post('upload/video')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('MEDIA', 'CREATE')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a video to Cloudflare Stream (Instructor/Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No video file uploaded');
    }

    if (!file.mimetype.startsWith('video/')) {
      throw new BadRequestException('Only video files are allowed for this endpoint');
    }

    return this.mediaService.uploadVideo(file);
  }
}
