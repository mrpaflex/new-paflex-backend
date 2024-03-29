import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {} from '../dto/posts.dto';
import { UserDocument } from 'src/user/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../schemas/comment.schema';
import { Model } from 'mongoose';
import { PostsService } from './posts.service';
import {
  CommentReply,
  CommentReplyDocument,
} from '../schemas/commentReply.schema';
import { ReactToCommentOrReplyDto } from '../dto/reaction.dto';
import {
  CommentDto,
  ReplyDto,
  UpdateCommentOrReplyDto,
} from '../dto/comment.dto';
import { PostTypeEnum } from 'src/common/enum/post.reactions.enum';
import { cloudinary } from 'src/common/utils/cloudinary/cloudinary';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(CommentReply.name)
    private replyModel: Model<CommentReplyDocument>,
    private readonly postService: PostsService,
  ) {}

  async addComment(
    payload: CommentDto,
    user: UserDocument,
    file: Express.Multer.File,
  ) {
    const { comment, postId, commentType } = payload;

    await this.postService.getById(postId);

    let uploadedImageUrl;
    let uploadedVideo;
    let cloud_id;

    if ((!payload || Object.keys(payload).length === 0) && !file) {
      throw new BadRequestException('Can not submit empty comment');
    }

    if (commentType === PostTypeEnum.Text) {
      if (!comment) {
        throw new BadRequestException('comment can not be empty');
      }
    }

    if (commentType === PostTypeEnum.Video) {
      if (!file) {
        throw new BadRequestException('file can not be empty');
      }

      const result = await cloudinary.uploader.upload(file.path);

      uploadedVideo = result.secure_url;
      cloud_id = result.public_id;
    }

    if (commentType === PostTypeEnum.Image) {
      if (!file) {
        throw new BadRequestException('file can not be empty');
      }

      const result = await cloudinary.uploader.upload(file.path);
      uploadedImageUrl = result.secure_url;
      cloud_id = result.public_id;
    }

    const createComment = await this.commentModel.create({
      comment,
      commentType,
      video: uploadedVideo,
      image: uploadedImageUrl,
      cloudinary_Id: cloud_id,
      postId,
      userId: user._id,
    });

    await this.postService.updateCommentCountInEachPost(postId, 'inc');

    return createComment;
  }

  async addReply(
    payload: ReplyDto,
    user: UserDocument,
    file: Express.Multer.File,
  ) {
    const { replyId, reply, commentId, replyType } = payload;

    if ((!payload || Object.keys(payload).length === 0) && !file) {
      throw new BadRequestException('Can not submit empty reply');
    }

    if (commentId) {
      await this.getCommentById(commentId);
    }

    if (replyId) {
      await this.getReplyById(replyId);
    }

    if (replyType === PostTypeEnum.Text) {
      if (!reply) {
        throw new BadRequestException('reply can not be empty');
      }
    }

    let uploadedImageUrl;
    let uploadedVideo;
    let cloud_id;

    if (replyType === PostTypeEnum.Video) {
      if (!file) {
        throw new BadRequestException('file can not be empty');
      }

      const result = await cloudinary.uploader.upload(file.path);

      uploadedVideo = result.secure_url;
      cloud_id = result.public_id;
    }

    if (replyType === PostTypeEnum.Image) {
      if (!file) {
        throw new BadRequestException('comment can not be empty');
      }

      const result = await cloudinary.uploader.upload(file.path);
      uploadedImageUrl = result.secure_url;
      cloud_id = result.public_id;
    }

    const createReply = await this.replyModel.create({
      video: uploadedVideo,
      image: uploadedImageUrl,
      cloudinary_Id: cloud_id,
      userId: user._id,
      replyId,
      reply,
      commentId,
      replyType,
    });

    if (!createReply) {
      throw new InternalServerErrorException(
        'error occur while replying... please try again',
      );
    }

    await this.updateReplyCommentTotalCount(commentId, replyId, 'inc');

    return true;
  }

  async getCommentById(commentId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async getReplyById(replyId: string) {
    const reply = await this.replyModel.findById(replyId);
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }
    return reply;
  }
  async updateReplyCommentTotalCount(
    commentId?: string,
    replyId?: string,
    action?: 'inc' | 'dec',
  ) {
    if (commentId) {
      await this.commentModel.findOneAndUpdate(
        {
          _id: commentId,
          ...(action === 'dec' && { replyCommentTotalCount: { $gte: 1 } }),
        },
        {
          $inc: {
            replyCommentTotalCount: action === 'inc' ? 1 : -1,
          },
        },
      );
    }

    if (replyId) {
      await this.replyModel.findOneAndUpdate(
        {
          _id: replyId,
          ...(action === 'dec' && { replyTotalCount: { $gte: 1 } }),
        },
        {
          $inc: {
            replyTotalCount: action === 'inc' ? 1 : -1,
          },
        },
      );
    }
  }

  async updateCommentOrReply(
    payload: UpdateCommentOrReplyDto,
    user: UserDocument,
    file: Express.Multer.File,
  ) {
    const { replyId, commentId, editText, updateType } = payload;
    if ((!payload || Object.keys(payload).length === 0) && !file) {
      throw new BadRequestException('please provide a value');
    }

    if (commentId) {
      const comment = await this.getCommentById(commentId);

      let updatedImageUrl;
      let updatedVideoUrl;
      let updateCloud_Id;

      if (updateType === PostTypeEnum.Text) {
        if (!editText) {
          throw new BadRequestException('can not submit empty text');
        }
      }

      if (updateType === PostTypeEnum.Image) {
        if (!file) {
          throw new BadRequestException('image can not be empty');
        }

        await this.commentModel.findOneAndUpdate(
          { _id: commentId },
          { video: null },
        );

        await cloudinary.uploader.destroy(comment.cloudinary_Id);

        const result = await cloudinary.uploader.upload(file.path);

        updatedImageUrl = result.secure_url;
        updateCloud_Id = result.public_id;
      }

      if (updateType === PostTypeEnum.Video) {
        if (!file) {
          throw new BadRequestException('video can not be empty');
        }

        await this.commentModel.findOneAndUpdate(
          { _id: commentId },
          { image: null },
        );
        await cloudinary.uploader.destroy(comment.cloudinary_Id);

        const result = await cloudinary.uploader.upload(file.path);
        updatedVideoUrl = result.secure_url;
        updateCloud_Id = result.public_id;
      }

      const updatedComment = await this.commentModel.findOneAndUpdate(
        { _id: commentId, userId: user._id },
        {
          comment: editText,
          commentType: updateType,
          video: updatedVideoUrl,
          image: updatedImageUrl,
          cloudinary_Id: updateCloud_Id,
          isCommentEdited: true,
        },
        { new: true, runValidators: true },
      );

      return updatedComment;
    }

    if (replyId) {
      const reply = await this.getReplyById(replyId);

      let updatedImageUrl;
      let updatedVideoUrl;
      let updateCloud_Id;

      if (updateType === PostTypeEnum.Text) {
        if (!editText) {
          throw new BadRequestException('can not submit empty text');
        }
      }

      if (updateType === PostTypeEnum.Image) {
        if (!file) {
          throw new BadRequestException('image can not be empty');
        }

        await this.replyModel.findOneAndUpdate(
          { _id: replyId },
          { video: null },
        );
        await cloudinary.uploader.destroy(reply.cloudinary_Id);

        const result = await cloudinary.uploader.upload(file.path);
        updatedImageUrl = result.secure_url;
        updateCloud_Id = result.public_id;
      }

      if (updateType === PostTypeEnum.Video) {
        if (!file) {
          throw new BadRequestException('video can not be empty');
        }

        await this.replyModel.findOneAndUpdate(
          { _id: commentId },
          { image: null },
        );
        await cloudinary.uploader.destroy(reply.cloudinary_Id);

        const result = await cloudinary.uploader.upload(file.path);

        updatedVideoUrl = result.secure_url;
        updateCloud_Id = result.public_id;
      }

      const updatedReply = await this.replyModel.findOneAndUpdate(
        { _id: replyId, userId: user._id },
        {
          reply: editText,
          replyType: updateType,
          video: updatedVideoUrl,
          image: updatedImageUrl,
          cloudinary_Id: updateCloud_Id,
          isReplyEdited: true,
        },
        { new: true, runValidators: true },
      );
      return updatedReply;
    }
  }

  async reactToCommentOrReply(
    payload: ReactToCommentOrReplyDto,
    user: UserDocument,
  ) {
    const { reactions, replyId, commentId } = payload;
    if (commentId) {
      const comment = await this.getCommentById(commentId);

      const alreadyReacted = comment.commentReactions.some((react) =>
        react.reactedBy.equals(user._id),
      );

      if (alreadyReacted) {
        await this.commentModel.findByIdAndUpdate(commentId, {
          $inc: { reactionCount: -1 },
          $pull: {
            commentReactions: {
              type: reactions,
              reactedBy: user._id,
            },
          },
        });
      } else {
        await this.commentModel.findByIdAndUpdate(commentId, {
          $inc: { reactionCount: 1 },
          $push: {
            commentReactions: {
              type: reactions,
              reactedBy: user._id,
            },
          },
        });
      }
    }

    if (replyId) {
      const reply = await this.getReplyById(replyId);

      const alreadyReacted = reply.replyReactions.some((react) =>
        react.reactedBy.equals(user._id),
      );

      if (alreadyReacted) {
        await this.replyModel.findByIdAndUpdate(replyId, {
          $inc: { replyReactionCount: -1 },
          $pull: {
            replyReactions: {
              type: reactions,
              reactedBy: user._id,
            },
          },
        });
      } else {
        await this.replyModel.findByIdAndUpdate(replyId, {
          $inc: { replyReactionCount: 1 },
          $push: {
            replyReactions: {
              type: reactions,
              reactedBy: user._id,
            },
          },
        });
      }
    }

    return true;
  }
}
