import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

/**
 * Ensures the uploads directory exists.
 */
function ensureUploadsDir(): void {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Sanitizes and generates a safe filename (optional unique prefix).
 */
function sanitizeFilename(filename: string, unique = true): string {
  const ext = path.extname(filename) || '';
  const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
  if (unique) {
    return `${Date.now()}-${base}${ext}`.toLowerCase();
  }
  return `${base}${ext}`.toLowerCase();
}

/**
 * Middleware class that handles uploading files or images to the `uploads` folder.
 * Apply to routes that accept multipart/form-data (e.g. single 'file' or 'image' field).
 */
@Injectable()
export class Upload implements NestMiddleware {
  private multerInstance = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        ensureUploadsDir();
        cb(null, UPLOADS_DIR);
      },
      filename: (_req, file, cb) => {
        cb(null, sanitizeFilename(file.originalname));
      },
    }),
    limits: {
      fileSize: 10 * 1024 * 1024 * 1024, // 100 MB
    },
  });

  use(req: Request, res: Response, next: NextFunction): void {
    this.multerInstance.single('file')(req, res, next);
  }
}

/**
 * Middleware for avatar uploads. Accepts one file under any form field name
 * (e.g. "avatar", "file", "image", "photo", or the filename like "test.png").
 */
@Injectable()
export class UploadAvatar implements NestMiddleware {
  private multerInstance = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        ensureUploadsDir();
        cb(null, UPLOADS_DIR);
      },
      filename: (_req, file, cb) => {
        cb(null, sanitizeFilename(file.originalname));
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  use(req: Request, res: Response, next: NextFunction): void {
    this.multerInstance.any()(req, res, next);
  }
}

/**
 * Multer instance for single file upload (field name: 'file').
 * Use in controllers with @UseInterceptors(FileInterceptor('file')) or apply Upload middleware.
 */
export const uploadSingle = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureUploadsDir();
      cb(null, UPLOADS_DIR);
    },
    filename: (_req, file, cb) => {
      cb(null, sanitizeFilename(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});
