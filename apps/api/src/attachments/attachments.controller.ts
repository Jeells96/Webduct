import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import type { AttachmentDto } from '@webduct/shared';
import { ATTACHMENT_LIMITS } from '@webduct/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
mkdirSync(UPLOAD_DIR, { recursive: true });

@Controller('attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: ATTACHMENT_LIMITS.maxFileSizeBytes },
      fileFilter: (_req, file, cb) => {
        const allowed = ATTACHMENT_LIMITS.allowedMimeTypes as readonly string[];
        cb(null, allowed.includes(file.mimetype));
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('note') note?: string,
  ): Promise<AttachmentDto> {
    if (!file) {
      throw new BadRequestException('No file, or file type not allowed.');
    }
    const row = await this.prisma.attachment.create({
      data: {
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        sizeBytes: file.size,
        mimeType: file.mimetype,
        note: note ?? null,
      },
    });
    return {
      id: row.id,
      filename: row.filename,
      url: row.url,
      sizeBytes: row.sizeBytes,
      mimeType: row.mimeType,
      note: row.note,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ ok: boolean }> {
    await this.prisma.attachment.deleteMany({ where: { id } });
    return { ok: true };
  }
}
