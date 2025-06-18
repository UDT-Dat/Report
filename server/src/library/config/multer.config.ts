import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
// Ensure uploads directory exists
const ensureUploadDirectory = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const uploadDir = './uploads/post';
ensureUploadDirectory(uploadDir);

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: uploadDir,
    filename: (req, file, callback) => {
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

    cb(null, true);
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 10, // Max 10 files total (banner + attachments)
  },
};

export const uploadDirectory = uploadDir;
