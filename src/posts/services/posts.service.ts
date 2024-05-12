import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PostEntity, PostsDocument } from '../schemas/posts.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from 'src/user/schemas/user.schema';

import {
  CreatePostDto,
  UpdatePostDto,
  ValidateActionDto,
} from '../dto/posts.dto';
import { ReactionDto, UpdateReactionDTO } from '../dto/reaction.dto';
import { OtpService } from 'src/otp/otp.service';
import { PostTypeEnum } from 'src/common/enum/post.reactions.enum';

import {
  deletePostFile,
  uploadFiles,
} from 'src/common/utils/aws-bucket/file-aws-bucket';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(PostEntity.name) private postModel: Model<PostsDocument>,
    private otpService: OtpService,
  ) {}

  async create(
    payload: CreatePostDto,
    user: UserDocument,
    files?: Array<Express.Multer.File>,
  ) {
    const { text, postType } = payload;
    let uploadedImagesUrl = [];
    let uploadedVideoUrl = [];
    let isVideo = false;

    const validVideoType = ['video/mp4'];
    if ((!payload || Object.keys(payload).length === 0) && !files) {
      throw new BadRequestException('Cannot submit empty post');
    }

    if (postType === PostTypeEnum.Text) {
      if (!text) {
        throw new BadRequestException('Text cannot be empty');
      }
    }

    if (postType === PostTypeEnum.Image) {
      if (!files || files.length === 0) {
        throw new BadRequestException('Image cannot be empty');
      }

      uploadedImagesUrl = await Promise.all(
        files.map(async (file: any) => {
          const uploadImage = await uploadFiles(file);

          return {
            location: uploadImage.Location,
            key: uploadImage.Key,
          };
        }),
      );

      for (const image of uploadedImagesUrl) {
        if (!image.location) {
          throw new BadRequestException('Error while uploading image');
        }
      }
    }

    if (postType === PostTypeEnum.Video) {
      isVideo = true;
      if (!files || files.length === 0) {
        throw new BadRequestException('video cannot be empty');
      }
      if (files?.length > 1) {
        throw new BadRequestException('Only one video can be uploaded');
      }

      if (!validVideoType.includes(files[0].mimetype)) {
        throw new BadRequestException('Invalid video type');
      }

      uploadedVideoUrl = await Promise.all(
        files.map(async (file) => {
          const uploadVideo = await uploadFiles(file);

          return {
            location: uploadVideo.Location,
            key: uploadVideo.Key,
          };
        }),
      );

      for (const video of uploadedVideoUrl) {
        if (!video.location) {
          throw new BadRequestException('Error while uploading video');
        }
      }
    }

    const createPost = await this.postModel.create({
      text: text,
      type: postType,
      images: uploadedImagesUrl,
      video: uploadedVideoUrl,
      isVideo: isVideo,
      creatorId: user._id,
    });
    return createPost;
  }

  async getAll(): Promise<PostsDocument[]> {
    return await this.postModel.find();
  }

  async getAllVideos(): Promise<PostsDocument[]> {
    return await this.postModel.find({ isVideo: true });
  }

  async getById(id: string): Promise<PostsDocument> {
    const post = await this.postModel.findOne({ _id: id });
    if (!post) {
      throw new NotFoundException('post not found');
    }
    return post;
  }

  async DeleteById(id: string, user: UserDocument) {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException('post not found');
    }

    if (user._id.toString() !== post.creatorId.toString()) {
      return;
    }

    if (post.video && post.video.length > 0) {
      await deletePostFile(post.video);
    }

    if (post.images && post.images.length > 0) {
      await deletePostFile(post.images);
    }

    await this.postModel.findByIdAndDelete(id, { new: true });

    return 'deleted';
  }

  async MyPosts(user: UserDocument) {
    const posts = await this.postModel.find({ creatorId: user._id });
    if (!posts) {
      return;
    }

    return posts;
  }

  async deleteMyPosts(ids: string[], user: UserDocument) {
    const posts = await this.postModel.find({
      _id: { $in: ids },
      creatorId: user._id,
    });
    posts.map(async (post) => {
      const images = post.images;
      const video = post.video;
      if (images && images.length > 0) {
        await deletePostFile(images);
      }
      if (video && video.length > 0) {
        await deletePostFile(video);
      }
      return;
    });

    await this.postModel.deleteMany({ _id: { $in: ids }, creatorId: user._id });

    return;
  }

  async updatePost(
    postId: string,
    payload: UpdatePostDto,
    user: UserDocument,
    files?: Array<Express.Multer.File>,
  ) {
    const { text, postType } = payload;

    if ((!payload || Object.keys(payload).length === 0) && !files) {
      throw new BadRequestException('Cannot submit empty post');
    }

    let updatedImagesUrl = [];
    let updatedVideoUrl = [];
    let isVideo = false;
    const validVideoType = ['video/mp4'];

    const postToUpdate = await this.getById(postId);

    if (postToUpdate.creatorId.toString() !== user._id.toString()) {
      throw new UnauthorizedException(
        'You are not authorized to update this post',
      );
    }

    if (postType === PostTypeEnum.Text && !text) {
      throw new BadRequestException('Text cannot be empty');
    }

    if (postType === PostTypeEnum.Image) {
      if (!files || files.length === 0) {
        throw new BadRequestException('Image cannot be empty');
      }

      if (postToUpdate.images && postToUpdate.images.length > 0) {
        await deletePostFile(postToUpdate.images);
        return;
      }

      if (postToUpdate.video && postToUpdate.video.length > 0) {
        await deletePostFile(postToUpdate.video);
        return;
      }

      updatedImagesUrl = await Promise.all(
        files.map(async (file) => {
          const uploadImage = await uploadFiles(file);
          return {
            location: uploadImage.Location,
            key: uploadImage.Key,
          };
        }),
      );

      for (const image of updatedImagesUrl) {
        if (!image.location) {
          throw new BadRequestException('Error while updating image');
        }
      }
    }

    if (postType === PostTypeEnum.Video) {
      isVideo = true;
      if (!files || files.length === 0) {
        throw new BadRequestException('video cannot be empty');
      }
      if (files?.length > 1) {
        throw new BadRequestException('Only one video can be uploaded');
      }
      if (!validVideoType.includes(files[0].mimetype)) {
        throw new BadRequestException('Invalid video type');
      }

      if (postToUpdate.images && postToUpdate.images.length > 0) {
        await deletePostFile(postToUpdate.images);
        return;
      }

      if (postToUpdate.video && postToUpdate.video.length > 0) {
        await deletePostFile(postToUpdate.video);
        return;
      }

      updatedVideoUrl = await Promise.all(
        files.map(async (file) => {
          const uploadVideo = await uploadFiles(file);
          return {
            location: uploadVideo.Location,
            key: uploadVideo.Key,
          };
        }),
      );

      for (const video of updatedVideoUrl) {
        if (!video.location) {
          throw new BadRequestException('Error while updating video');
        }
      }
    }

    const updatedPost = await this.postModel.findOneAndUpdate(
      { _id: postId, creatorId: user._id },
      {
        type: postType,
        video: updatedVideoUrl,
        images: updatedImagesUrl,
        isPostEdited: true,
        isVideo: isVideo,
        text: text,
      },

      {
        new: true,
        runValidators: true,
      },
    );
    return updatedPost;
  }

  async reactToPost(payload: ReactionDto, user: UserDocument) {
    const { reactions, postId } = payload;
    const userId = user._id;
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post you want to like doesn't exist`);
    }

    const alreadyReacted = post.reactions.some((react) =>
      react.reactedBy.equals(userId),
    );

    if (alreadyReacted) {
      await this.postModel.findByIdAndUpdate(postId, {
        $inc: { reactionTotal: -1 },
        $pull: {
          reactions: {
            type: reactions,
            reactedBy: userId,
          },
        },
      });
    } else {
      await this.postModel.findByIdAndUpdate(postId, {
        $inc: { reactionTotal: 1 },
        $push: {
          reactions: {
            type: reactions,
            reactedBy: userId,
          },
        },
      });
    }

    return true;
  }

  async updateCommentCountInEachPost(postId: string, action: 'inc' | 'dec') {
    await this.postModel.findOneAndUpdate(
      {
        _id: postId,
        ...(action === 'dec' && { commentsTotalCount: { $gte: 1 } }),
      },
      {
        $inc: {
          commentsTotalCount: action === 'inc' ? 1 : -1,
        },
      },
    );
  }

  async updatePostReaction(payload: UpdateReactionDTO, user: UserDocument) {
    const { reactions, postId } = payload;

    const post = await this.getById(postId);

    const alreadyReacted = post.reactions.some((reacted) =>
      reacted.reactedBy.equals(user._id),
    );

    if (alreadyReacted) {
      await this.postModel.findOneAndUpdate(
        { _id: postId, 'reactions.reactedBy': user._id },
        {
          $set: {
            reactions: {
              type: reactions,
              reactedBy: user._id,
            },
          },
        },
      );
    } else {
      await this.postModel.findOneAndUpdate(
        { _id: postId },
        {
          $inc: { reactionTotal: 1 },
          $push: {
            reactions: {
              type: reactions,
              reactedBy: user._id,
            },
          },
        },
      );
    }

    return reactions;
  }

  async postGifters(userId: string, postId: string, amount: number) {
    await this.postModel.findOneAndUpdate(
      { _id: postId },
      {
        $push: {
          gifts: {
            amount: amount,
            giftedBy: userId,
          },
        },
      },
      { new: true },
    );
    return true;
  }
}
