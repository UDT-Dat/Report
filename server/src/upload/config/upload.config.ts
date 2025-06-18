import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

// Ensure uploads directory exists
const ensureUploadDirectory = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create upload directory
const uploadDir = './uploads/images';

// Ensure directory exists
ensureUploadDirectory(uploadDir);

export const uploadConfig: MulterOptions = {
  storage: diskStorage({
    destination: uploadDir,
    filename: (req, file, callback) => {
      // Generate unique filename with timestamp and random string
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const baseName = file.originalname
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9]/g, '_');
      callback(null, `${baseName}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file || typeof file === 'string') {
      return cb(null, true);
    }
    if (file.fieldname === 'image') {
      if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
        return cb(
          new BadRequestException(
            'Only image files are allowed (jpg, jpeg, png, gif)',
          ),
          false,
        );
      }
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 10, // Maximum 10 files per request
  },
};

export const uploadDirectory = uploadDir;
