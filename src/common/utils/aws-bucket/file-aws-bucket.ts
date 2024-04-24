import { S3 } from 'aws-sdk';
//import * as sharp from 'sharp';
import { ENVIRONMENT } from 'src/common/constant/environmentVariables/environment.var';
import * as fs from 'fs';
// import * as ffmpeg from 'fluent-ffmpeg';
// const ffmpeg = require('@ffmpeg-installer/ffmpeg');
// import path from 'path';

export const uploadFiles = async (files: any) => {
  if (!files) {
    return;
  }

  const s3 = new S3({
    accessKeyId: ENVIRONMENT.AWS.accessKeyId,
    secretAccessKey: ENVIRONMENT.AWS.secretAccessKey,
  });

  const file = await resolved(files);

  const params = {
    Bucket: ENVIRONMENT.AWS.Bucket,
    Key: file.filename,
    Body: file.buffer,
  };

  return await s3.upload(params).promise();
};

export const deletePostFile = async (images: any) => {
  if (!images) {
    return;
  }
  if (
    !images ||
    !Array.isArray(images) ||
    typeof images !== 'object' ||
    !(Array.isArray(images) && images.map((image) => image.Key))
  ) {
    return;
  }

  const s3 = new S3({
    accessKeyId: ENVIRONMENT.AWS.accessKeyId,
    secretAccessKey: ENVIRONMENT.AWS.secretAccessKey,
  });

  const imagesKey = images.map((imageKey) => ({ Key: imageKey.key }));

  const params = {
    Bucket: ENVIRONMENT.AWS.BucketName,
    Delete: {
      Objects: imagesKey,
      Quiet: false,
    },
  };

  return new Promise((resolve, reject) => {
    s3.deleteObjects(params, (err, data) => {
      if (err) {
        reject(false);
      } else {
        resolve(true);
      }
    });
  });
};

const resolved = async (files: any) => {
  const fileBuffer = fs.readFileSync(files.path);

  if (typeof files === 'object' && files !== null) {
    const validVideoType = ['video/mp4'];

    if (validVideoType.includes(files.mimetype)) {
      // const compressedVideo = await processVideo(fileBuffer, files.path);

      return { buffer: fileBuffer, filename: files.path };
    } else {
      return { buffer: fileBuffer, filename: files.path };
      // const resizedImageBuffer = await sharp(fileBuffer)
      //   .resize(80)
      //   .webp({ quality: 80 })
      //   .toBuffer();

      // return { buffer: resizedImageBuffer, filename: files.path };
    }
  } else {
    return;
  }
};

// export const processVideo = async (
//   buffer: any,
//   filePath: string,
// ): Promise<string> => {
//   return new Promise<string>((resolve, reject) => {
//     return ffmpeg(buffer) // Use ffmpeg from fluent-ffmpeg
//       .videoCodec('libx264')
//       .size('640x?')
//       .output(filePath)
//       .on('end', () => resolve(filePath))
//       .on('error', (err) => reject(err))
//       .run();
//   });
// };
