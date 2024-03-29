import { cloudinary } from './cloudinary';
export const cloudDeletePost = async (posts: any) => {
  const files = await Promise.all(
    posts.map(async (post) => {
      return {
        image: post.images,
        video: post.video,
      };
    }),
  );

  if (!files) {
    return;
  }

  const formattedFiles: string[] = [];
  files.forEach((file) => {
    formattedFiles.push(JSON.stringify(file, null, 2));
  });

  const imageCloud_Id: string[] = [];
  const videoCloud_Id: string[] = [];

  formattedFiles.forEach((file) => {
    const parsedFile = JSON.parse(file);
    parsedFile.image.forEach((image) => {
      imageCloud_Id.push(image.cloudinaryId);
    });
    parsedFile.video.forEach((video) => {
      videoCloud_Id.push(video.cloudinaryId);
    });
  });

  if (imageCloud_Id || imageCloud_Id.length > 0) {
    await Promise.all(
      imageCloud_Id.map(async (cloudId) => {
        await cloudinary.uploader.destroy(cloudId);
      }),
    );
  }

  if (videoCloud_Id || videoCloud_Id.length > 0) {
    await Promise.all(
      videoCloud_Id.map(async (cloudId) => {
        await cloudinary.uploader.destroy(cloudId);
      }),
    );
  }
};
