import { Controller, Post, Req } from '@nestjs/common';
import * as express from 'express';

@Controller('upload')
export class UploadController {
  @Post()
  uploadFile(@Req() req: express.Request): { path: string; filename: string } {
    const file = req.file;
    if (!file) {
      return { path: '', filename: '' };
    }
    const stored = file as { path: string; filename: string };
    return {
      path: stored.path,
      filename: stored.filename,
    };
  }
}
