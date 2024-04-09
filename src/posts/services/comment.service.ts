import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
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
  DeleteCommentOrReplyDTO,
  ReplyDto,
  UpdateCommentOrReplyDto,
} from '../dto/comment.dto';
import { PostTypeEnum } from 'src/common/enum/post.reactions.enum';
import {
  deletePostFile,
  uploadFiles,
} from 'src/common/utils/aws-bucket/file-aws-bucket';

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

    let uploadedImageUrl = [];
    let uploadedVideo = [];

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

      const result = await uploadFiles(file);

      uploadedVideo.push({
        location: result.Location,
        key: result.Key,
      });
    }

    if (commentType === PostTypeEnum.Image) {
      if (!file) {
        throw new BadRequestException('file can not be empty');
      }

      const result = await uploadFiles(file);
      uploadedImageUrl.push({
        location: result.Location,
        key: result.Key,
      });
    }

    const createComment = await this.commentModel.create({
      comment,
      commentType,
      video: uploadedVideo,
      image: uploadedImageUrl,
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

    let uploadedImageUrl = [];
    let uploadedVideo = [];

    if (replyType === PostTypeEnum.Video) {
      if (!file) {
        throw new BadRequestException('file can not be empty');
      }
      const result = await uploadFiles(file);
      uploadedVideo.push({
        location: result.Location,
        key: result.Key,
      });
    }

    if (replyType === PostTypeEnum.Image) {
      if (!file) {
        throw new BadRequestException('comment can not be empty');
      }

      const result = await uploadFiles(file);
      uploadedImageUrl.push({
        location: result.Location,
        key: result.Key,
      });
    }

    const createReply = await this.replyModel.create({
      video: uploadedVideo,
      image: uploadedImageUrl,
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

    await this.updateReplyOrCommentTotalCount(commentId, replyId, 'inc');

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
  async updateReplyOrCommentTotalCount(
    commentId?: string,
    replyId?: string,
    action?: 'inc' | 'dec',
  ) {
    if (commentId) {
      await this.commentModel.findOneAndUpdate(
        {
          _id: commentId,
          ...(action === 'dec' && { replyToCommentTotalCount: { $gte: 1 } }),
        },
        {
          $inc: {
            replyToCommentTotalCount: action === 'inc' ? 1 : -1,
          },
        },
      );
    }

    if (replyId) {
      await this.replyModel.findOneAndUpdate(
        {
          _id: replyId,
          ...(action === 'dec' && { replyToReplyTotalCount: { $gte: 1 } }),
        },
        {
          $inc: {
            replyToReplyTotalCount: action === 'inc' ? 1 : -1,
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

      let updatedImageUrl = [];
      let updatedVideoUrl = [];

      if (updateType === PostTypeEnum.Text) {
        if (!editText) {
          throw new BadRequestException('can not submit empty text');
        }
      }

      if (updateType === PostTypeEnum.Image) {
        if (!file) {
          throw new BadRequestException('image can not be empty');
        }

        if (comment.image && comment.image.length > 0) {
          await deletePostFile(comment.image);
          return;
        }

        if (comment.video && comment.video.length > 0) {
          await deletePostFile(comment.video);
          return;
        }

        await this.commentModel.findOneAndUpdate(
          { _id: commentId },
          { video: [] },
        );

        const result = await uploadFiles(file);

        updatedImageUrl.push({
          location: result.Location,
          key: result.Key,
        });
      }

      if (updateType === PostTypeEnum.Video) {
        if (!file) {
          throw new BadRequestException('video can not be empty');
        }

        if (comment.image && comment.image.length > 0) {
          await deletePostFile(comment.image);
          return;
        }

        if (comment.video && comment.video.length > 0) {
          await deletePostFile(comment.video);
          return;
        }

        await this.commentModel.findOneAndUpdate(
          { _id: commentId },
          { image: [] },
        );

        const result = await uploadFiles(file);

        updatedVideoUrl.push({
          location: result.Location,
          key: result.Key,
        });
      }

      const updatedComment = await this.commentModel.findOneAndUpdate(
        { _id: commentId, userId: user._id },
        {
          comment: editText,
          commentType: updateType,
          video: updatedVideoUrl,
          image: updatedImageUrl,
          isCommentEdited: true,
        },
        { new: true, runValidators: true },
      );

      return updatedComment;
    }

    if (replyId) {
      const reply = await this.getReplyById(replyId);

      let updatedImageUrl = [];
      let updatedVideoUrl = [];

      if (updateType === PostTypeEnum.Text) {
        if (!editText) {
          throw new BadRequestException('can not submit empty text');
        }
      }

      if (updateType === PostTypeEnum.Image) {
        if (!file) {
          throw new BadRequestException('image can not be empty');
        }

        if (reply.image && reply.image.length > 0) {
          await deletePostFile(reply.image);
          return;
        }

        if (reply.video && reply.video.length > 0) {
          await deletePostFile(reply.video);
          return;
        }

        await this.replyModel.findOneAndUpdate({ _id: replyId }, { video: [] });

        const result = await uploadFiles(file);
        updatedImageUrl.push({
          location: result.Location,
          key: result.Key,
        });
      }

      if (updateType === PostTypeEnum.Video) {
        if (!file) {
          throw new BadRequestException('video can not be empty');
        }

        if (reply.image && reply.image.length > 0) {
          await deletePostFile(reply.image);
          return;
        }

        if (reply.video && reply.video.length > 0) {
          await deletePostFile(reply.video);
          return;
        }

        await this.replyModel.findOneAndUpdate(
          { _id: commentId },
          { image: [] },
        );

        const result = await uploadFiles(file);

        updatedVideoUrl.push({
          location: result.Location,
          key: result.Key,
        });
      }

      const updatedReply = await this.replyModel.findOneAndUpdate(
        { _id: replyId, userId: user._id },
        {
          reply: editText,
          replyType: updateType,
          video: updatedVideoUrl,
          image: updatedImageUrl,
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

  async removeCommentOrReply(
    user: UserDocument,
    payload: DeleteCommentOrReplyDTO,
  ) {
    const { commentId, replyId } = payload;

    // Input Validation
    if (!commentId && !replyId) {
      throw new BadRequestException(
        'Either commentId or replyId must be provided',
      );
    }

    if (commentId) {
      const comment = await this.getCommentById(commentId);
      // Check authorization for deleting comment
      await this.authorizeCommentDeletion(user, commentId);

      // Delete comment and associated replies
      await this.deleteCommentAndReplies(commentId);

      // Update comment count in associated post
      await this.postService.updateCommentCountInEachPost(
        comment.postId.toString(),
        'dec',
      );

      return 'Comment deleted';
    }

    if (replyId) {
      // Check authorization for deleting reply
      const reply = await this.getReplyById(replyId);

      await this.authorizeReplyDeletion(user, replyId);

      // Delete reply
      await this.deleteReply(replyId);

      if (reply.replyId) {
        await this.updateReplyOrCommentTotalCount(
          '',
          reply.replyId.toString(),
          'dec',
        );
      }

      if (reply.commentId) {
        await this.updateReplyOrCommentTotalCount(
          reply.commentId.toString(),
          '',
          'dec',
        );
      }

      return 'Reply deleted';
    }
  }

  async authorizeCommentDeletion(user: UserDocument, commentId: string) {
    const comment = await this.getCommentById(commentId);
    if (comment.userId.toString() !== user._id.toString()) {
      throw new UnauthorizedException('Not Authorized to delete this comment');
    }
  }

  async authorizeReplyDeletion(user: UserDocument, replyId: string) {
    const reply = await this.getReplyById(replyId);
    if (reply.userId.toString() !== user._id.toString()) {
      throw new UnauthorizedException('Not Authorized to delete this reply');
    }
  }

  async deleteCommentAndReplies(commentId: string) {
    await this.deleteAwsAssets(commentId);

    await Promise.all([
      this.commentModel.findOneAndDelete({ _id: commentId }),
      this.replyModel.deleteMany({ commentId: commentId }),
    ]);
  }

  async deleteReply(replyId: string) {
    await this.deleteAwsReplyAssets(replyId);

    await this.replyModel.findOneAndDelete({ _id: replyId });
  }

  async deleteAwsAssets(resourceId: string) {
    const resource = await this.getCommentById(resourceId);
    if (resource.image && resource.image.length > 0) {
      await deletePostFile(resource.image);
      return;
    }

    if (resource.video && resource.video.length > 0) {
      await deletePostFile(resource.video);
      return;
    }
  }

  async deleteAwsReplyAssets(resourceId: string) {
    const resource = await this.getReplyById(resourceId);
    if (resource.image && resource.image.length > 0) {
      await deletePostFile(resource.image);
      return;
    }

    if (resource.video && resource.video.length > 0) {
      await deletePostFile(resource.video);
      return;
    }
  }
}
