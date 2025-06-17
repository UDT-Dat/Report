import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';
import * as fs from 'fs';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { firebaseStorage } from './config/firebase-admin';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Get image path for public access (local storage)
   */
  getImagePath(filePath: string): string {
    const relativePath = filePath.replace(/\\/g, '/');
    return `/${relativePath}`;
  }

  /**
   * Upload image buffer to Cloudinary
   */
  async uploadToCloudinary(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    let buffer: Buffer;

    // Check if file has buffer (memory storage) or path (disk storage)
    if (file.buffer) {
      buffer = file.buffer;
    } else if (file.path) {
      // Read file from disk if using disk storage
      try {
        buffer = fs.readFileSync(file.path);
        // Optionally delete the temporary file after reading
        fs.unlinkSync(file.path);
      } catch {
        throw new BadRequestException('Failed to read uploaded file');
      }
    } else {
      throw new BadRequestException(
        'Invalid file: no buffer or path available',
      );
    }

    const uploadStream = cloudinary.uploader.upload_stream;
    const streamUpload = (
      fileBuffer: Buffer,
      options: UploadApiOptions = {},
    ) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = uploadStream(options, (error, result) => {
          if (error) {
            let message: string;
            if (error instanceof Error) {
              message = error.message;
            } else if (typeof error === 'object') {
              message = JSON.stringify(error);
            } else {
              message = String(error);
            }
            return reject(new Error(message));
          }
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Cloudinary upload returned undefined result'));
          }
        });
        stream.end(fileBuffer);
      });
    };

    return await streamUpload(buffer, { resource_type: 'auto' });
  }

  async uploadImageToCloudinary(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('Invalid file input');
    }

    let buffer: Buffer;

    // Handle both memory and disk storage
    if (file.buffer) {
      buffer = file.buffer;
    } else if (file.path) {
      try {
        buffer = fs.readFileSync(file.path);
        // Optionally delete the temporary file after reading
        fs.unlinkSync(file.path);
      } catch {
        throw new BadRequestException('Failed to read uploaded file');
      }
    } else {
      throw new BadRequestException(
        'Invalid file: no buffer or path available',
      );
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'raw' },
        (error, result) => {
          if (error) return reject(new BadRequestException(error.message));
          if (!result?.secure_url) {
            return reject(new BadRequestException('Upload failed'));
          }
          resolve(result.secure_url);
        },
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }

  async uploadToFirebase(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('Invalid file input');
    }

    const fileName = `${folder}/${uuidv4()}-${file.originalname}`;
    const firebaseFile = firebaseStorage.file(fileName);

    const buffer = file.buffer || (file.path && fs.readFileSync(file.path));
    if (!buffer) {
      throw new BadRequestException(
        'Invalid file: no buffer or path available',
      );
    }

    return new Promise<string>((resolve, reject) => {
      const stream = firebaseFile.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          contentDisposition: `attachment; filename="${file.originalname}"`,
        },
      });

      stream.on('error', (err) => {
        reject(
          new BadRequestException(`Firebase upload failed: ${err.message}`),
        );
      });

      stream.on('finish', () => {
        firebaseFile
          .makePublic()
          .then(() => {
            resolve(firebaseFile.publicUrl());
          })
          .catch(() => {
            reject(new BadRequestException('Failed to make file public'));
          });
      });

      stream.end(buffer);

      if (file.path) fs.unlinkSync(file.path);
    });
  }
}
