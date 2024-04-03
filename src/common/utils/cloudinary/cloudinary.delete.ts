import { cloudinary } from './cloudinary';

export const cloudDeletePostImageOrVideo = async (post: any) => {
  if (post.images && post.images.length > 0) {
    const files = await Promise.all(
      post.images.map(async (image: any) => {
        return {
          cloudinaryId: image.cloudinaryId,
        };
      }),
    );

    await Promise.all(
      files.map(async (cloudId) => {
        await cloudinary.uploader.destroy(cloudId.cloudinaryId);
      }),
    );
  }

  if (post.video && post.video.length > 0) {
    const files = await Promise.all(
      post.video.map(async (vid: any) => {
        return {
          cloudinaryId: vid.cloudinaryId,
        };
      }),
    );

    await Promise.all(
      files.map(async (cloudId) => {
        await cloudinary.uploader.destroy(cloudId.cloudinaryId);
      }),
    );
  }
};

export const cloudDeletePost = async (posts: any) => {
  if (!posts || posts.length === 0) {
    return;
  }

  const formattedFiles: { image: any[]; video: any[] }[] = posts.map(
    (post: any) => ({
      image: post.images || [],
      video: post.video || [],
    }),
  );

  const imageCloud_Id = [];
  const videoCloud_Id = [];

  formattedFiles.forEach((file) => {
    file.image.forEach((image: any) => {
      imageCloud_Id.push(image.cloudinaryId);
    });
    file.video.forEach((video: any) => {
      videoCloud_Id.push(video.cloudinaryId);
    });
  });

  if (imageCloud_Id.length > 0) {
    await Promise.all(
      imageCloud_Id.map(async (cloudId) => {
        await cloudinary.uploader.destroy(cloudId);
      }),
    );
  }

  if (videoCloud_Id.length > 0) {
    await Promise.all(
      videoCloud_Id.map(async (cloudId) => {
        await cloudinary.uploader.destroy(cloudId);
      }),
    );
  }
};
