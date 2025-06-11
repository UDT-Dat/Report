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
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Upload a single image file' })
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
        path: {
          type: 'string',
          example: '/uploads/images/image-1703789123456-123456789.jpg',
          description: 'Path to the uploaded image',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  uploadSingle(@UploadedFile() file: Express.Multer.File): { path: string } {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    // File is already validated by multer's fileFilter before reaching here
    const imagePath = this.uploadService.getImagePath(file.path);
    return { path: imagePath };
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 files
  @ApiOperation({ summary: 'Upload multiple image files' })
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
        paths: {
          type: 'array',
          items: { type: 'string' },
          example: [
            '/uploads/images/image1-1703789123456-123456789.jpg',
            '/uploads/images/image2-1703789123456-987654321.png',
          ],
          description: 'Array of paths to the uploaded images',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid files' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{ paths: string[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    // Files are already validated by multer's fileFilter before reaching here
    const imagePaths = files.map((file) =>
      this.uploadService.getImagePath(file.path),
    );
    return { paths: imagePaths };
  }
}
