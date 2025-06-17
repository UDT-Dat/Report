import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import * as multer from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MulterExceptionFilter } from '../common/filters/multer-exception.filter';
import { UploadService } from './upload.service';

@ApiTags('Image')
@Controller('image')
@UseFilters(MulterExceptionFilter)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('single')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('image', { storage: multer.memoryStorage() }),
  )
  @ApiOperation({ summary: 'Upload a single image file to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example:
            'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg',
          description: 'Cloudinary URL of uploaded image',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const result = await this.uploadService.uploadToCloudinary(file);
    return { url: result.secure_url };
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FilesInterceptor('images', 10, { storage: multer.memoryStorage() }),
  )
  @ApiOperation({ summary: 'Upload multiple image files to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Array of image files to upload (max 10)',
        },
      },
      required: ['images'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        urls: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'https://res.cloudinary.com/demo/image/upload/v1234567890/image1.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1234567890/image2.png',
          ],
          description: 'Cloudinary URLs of uploaded images',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid files' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    const uploadResults = await Promise.all(
      files.map((file) => this.uploadService.uploadToCloudinary(file)),
    );

    const urls = uploadResults.map((res) => res.secure_url);
    return { urls };
  }
}
