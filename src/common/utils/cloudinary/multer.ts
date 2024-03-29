import { InternalServerErrorException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import * as path from 'path';

export const multerOptions: MulterOptions = {
  storage: diskStorage({
    filename: (req, file, cb) => {
      const splitFileName = file.originalname.split('.');
      const random = Math.round(Math.random() * 100);
      const newFileName = `${splitFileName[0]}_${random}.${splitFileName[1]}`;

      cb(null, newFileName);
    },
  }),

  fileFilter: (req, file, cb) => {
    try {
      const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.pdf, mp4, webp'];
      const ext = path.extname(file.originalname).toLowerCase();

      if (!allowedFileTypes.includes(ext)) {
        return cb(new Error('File type is not supported'), false);
      }
      cb(null, true);
    } catch (error) {
      throw new InternalServerErrorException(
        'server error while uploading profile',
      );
    }
  },
};
