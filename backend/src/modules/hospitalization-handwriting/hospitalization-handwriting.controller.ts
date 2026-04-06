import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { HospitalizationHandwritingService } from './hospitalization-handwriting.service';

const MAX_BYTES = 3 * 1024 * 1024;

@Controller('hospitalization-handwriting')
export class HospitalizationHandwritingController {
  constructor(
    private readonly hospitalizationHandwritingService: HospitalizationHandwritingService,
  ) {}

  @Post('parse')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.mimetype)) {
          cb(
            new BadRequestException(
              'Only JPEG, PNG, or WebP images are allowed.',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  parse(@UploadedFile() file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Missing image file (field name: file).');
    }
    return this.hospitalizationHandwritingService.parseImage(
      file.buffer,
      file.mimetype,
    );
  }
}
