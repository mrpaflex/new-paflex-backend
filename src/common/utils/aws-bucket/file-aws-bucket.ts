import { S3 } from 'aws-sdk';
import * as sharp from 'sharp';
import { ENVIRONMENT } from 'src/common/constant/environmentVariables/environment.var';
import * as fs from 'fs';

export const uploadFiles = async (files: any) => {
  if (!files) {
    return;
  }

  const s3 = new S3({
    accessKeyId: ENVIRONMENT.AWS.accessKeyId,
    secretAccessKey: ENVIRONMENT.AWS.secretAccessKey,
  });

  const file = await resolved(files);

  const fileBuffer = fs.readFileSync(file.path);

  const resizedImageBuffer = await sharp(fileBuffer)
    .resize(80)
    .webp({ quality: 80 })
    .toBuffer();

  const params = {
    Bucket: ENVIRONMENT.AWS.Bucket,
    Key: file.filename,
    Body: resizedImageBuffer,
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
  let newFile;
  if (Array.isArray(files)) {
    files.map((file: any) => {
      newFile = file;
      return newFile;
    });
  } else if (typeof files === 'object' && files !== null) {
    return files;
  } else {
    return;
  }
  return newFile;
};
