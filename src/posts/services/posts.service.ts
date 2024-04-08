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
import { cloudinary } from 'src/common/utils/cloudinary/cloudinary';
import { PostTypeEnum } from 'src/common/enum/post.reactions.enum';
import * as path from 'path';
import {
  cloudDeletePost,
  cloudDeletePostImageOrVideo,
} from 'src/common/utils/cloudinary/cloudinary.delete';

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
          const uploadImage = await cloudinary.uploader.upload(file.path);
          return {
            url: uploadImage.secure_url,
            cloudinaryId: uploadImage.public_id,
          };
        }),
      );

      for (const image of uploadedImagesUrl) {
        if (!image.url) {
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

      uploadedVideoUrl = await Promise.all(
        files.map(async (file) => {
          const uploadVideo = await cloudinary.uploader.upload(file.path);

          return {
            url: uploadVideo.secure_url,
            cloudinaryId: uploadVideo.public_id,
          };
        }),
      );

      for (const video of uploadedVideoUrl) {
        if (!video.url) {
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
    await this.otpService.sendOtp(user.email);

    return {
      Response: `kindly check email to verify your action`,
    };
  }

  async MyPosts(user: UserDocument) {
    const posts = await this.postModel.find({ user: user });
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

    await cloudDeletePost(posts);

    await this.postModel.deleteMany({ _id: { $in: ids }, creatorId: user._id });

    return 'done';
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

      await cloudDeletePostImageOrVideo(postToUpdate);

      updatedImagesUrl = await Promise.all(
        files.map(async (file) => {
          const uploadImage = await cloudinary.uploader.upload(file.path);
          return {
            url: uploadImage.secure_url,
            cloudinaryId: uploadImage.public_id,
          };
        }),
      );

      for (const image of updatedImagesUrl) {
        if (!image.url) {
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

      await cloudDeletePostImageOrVideo(postToUpdate);

      updatedVideoUrl = await Promise.all(
        files.map(async (file) => {
          const uploadVideo = await cloudinary.uploader.upload(file.path);
          return {
            url: uploadVideo.secure_url,
            cloudinaryId: uploadVideo.public_id,
          };
        }),
      );

      for (const video of updatedVideoUrl) {
        if (!video.url) {
          throw new BadRequestException('Error while uploading video');
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

  async validateDeletePostAction(
    id: string,
    payload: ValidateActionDto,
    user: UserDocument,
  ) {
    const { email, code } = payload;
    const post = await this.postModel.findById(id);

    if (post.creatorId.toString() != user._id.toString()) {
      throw new UnauthorizedException('Not authorized');
    }
    await this.otpService.verifyOtp(code, email);

    const images = post.images;
    const video = post.video;

    if (images) {
      images.map(async (image) => {
        await cloudinary.uploader.destroy(image.cloudinaryId);
      });
    }

    if (video) {
      images.map(async (vid) => {
        await cloudinary.uploader.destroy(vid.cloudinaryId);
      });
    }

    await this.postModel.findByIdAndDelete(id, { new: true });
    return 'post deleted';
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
}
