import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  /**
   * Get image path for public access
   */
  getImagePath(filePath: string): string {
    // Convert file path to URL path
    const relativePath = filePath.replace(/\\/g, '/');
    return `/${relativePath}`;
  }
}
