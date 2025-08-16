import mongoose from 'mongoose';
import { UserProgress } from '../schema/progress';
import { UserBookmark } from '../schema/bookmark';
import Question from '../schema/question';

class UserProgressService {
  private static instance: UserProgressService;

  private constructor() {}

  public static getInstance(): UserProgressService {
    if (!UserProgressService.instance) {
      UserProgressService.instance = new UserProgressService();
    }
    return UserProgressService.instance;
  }

  public async updateProgress(userId: string, questionId: string, isCompleted: boolean) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const questionObjectId = new mongoose.Types.ObjectId(questionId);

    const question = await Question.findById(questionObjectId);
    if (!question) {
      throw new Error('Question not found');
    }

    const progressData = {
      userId: userObjectId,
      questionId: questionObjectId,
      isCompleted,
      completedAt: isCompleted ? new Date() : null
    };

    const progress = await UserProgress.findOneAndUpdate(
      { userId: userObjectId, questionId: questionObjectId },
      progressData,
      { new: true, upsert: true }
    );

    return {
      id: progress._id.toString(),
      questionId: questionId,
      isCompleted: progress.isCompleted,
      completedAt: progress.completedAt,
      createdAt: progress.createdAt,
      updatedAt: progress.updatedAt
    };
  }

  public async getProgressStats(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [totalQuestions, completedCount] = await Promise.all([
      Question.countDocuments(),
      UserProgress.countDocuments({ userId: userObjectId, isCompleted: true })
    ]);

    const completionPercentage = totalQuestions > 0 ? 
      Math.round((completedCount / totalQuestions) * 100) : 0;

    return {
      totalQuestions,
      completedQuestions: completedCount,
      completionPercentage
    };
  }

  public async addBookmark(userId: string, questionId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const questionObjectId = new mongoose.Types.ObjectId(questionId);

    const question = await Question.findById(questionObjectId);
    if (!question) {
      throw new Error('Question not found');
    }

    const bookmark = await UserBookmark.findOneAndUpdate(
      { userId: userObjectId, questionId: questionObjectId },
      { userId: userObjectId, questionId: questionObjectId },
      { new: true, upsert: true }
    );

    return {
      id: bookmark._id.toString(),
      questionId: questionId,
      createdAt: bookmark.createdAt,
      updatedAt: bookmark.updatedAt
    };
  }

  public async removeBookmark(userId: string, questionId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const questionObjectId = new mongoose.Types.ObjectId(questionId);

    const result = await UserBookmark.findOneAndDelete({
      userId: userObjectId,
      questionId: questionObjectId
    });

    return !!result;
  }

  public async getUserBookmarks(userId: string, page: number = 1, limit: number = 20) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * limit;

    const [bookmarks, totalCount] = await Promise.all([
      UserBookmark.find({ userId: userObjectId })
        .populate({
          path: 'questionId',
          populate: { path: 'category', select: 'title' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserBookmark.countDocuments({ userId: userObjectId })
    ]);

    const formattedBookmarks = bookmarks.map(bookmark => {
      const question = bookmark.questionId as any; 
      return {
        id: bookmark._id.toString(),
        questionId: question._id.toString(),
        question: {
          id: question._id.toString(),
          title: question.title,
          difficulty: question.difficulty,
          category: {
            id: question.category._id.toString(),
            title: question.category.title
          }
        },
        createdAt: bookmark.createdAt,
        updatedAt: bookmark.updatedAt
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      bookmarks: formattedBookmarks,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
}

export default UserProgressService;