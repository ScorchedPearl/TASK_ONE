import mongoose from 'mongoose';
import Question from '../schema/question';
import Category from '../schema/category';
import { UserProgress } from '../schema/progress';
import { UserBookmark } from '../schema/bookmark';

interface ContentFilters {
  search?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  category?: string;
}

interface ContentOptions extends ContentFilters {
  sortBy?: string;
  page?: number;
  limit?: number;
}

class ContentService {
  private static instance: ContentService;

  private constructor() {}

  public static getInstance(): ContentService {
    if (!ContentService.instance) {
      ContentService.instance = new ContentService();
    }
    return ContentService.instance;
  }

  public async getContent(options: ContentOptions, userId?: string) {
    const {
      search,
      difficulty,
      category,
      sortBy = 'title',
      page = 1,
      limit = 20
    } = options;

    const query: any = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (category) {
      query.category = new mongoose.Types.ObjectId(category);
    }

    let sort: any = {};
    switch (sortBy) {
      case 'difficulty':
        sort = { difficulty: 1, title: 1 };
        break;
      default:
        sort = { title: 1 };
    }

    const skip = (page - 1) * limit;
    const totalItems = await Question.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const questions = await Question.find(query)
      .populate('category', 'title slNo')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    let userProgress = new Map();
    let userBookmarks = new Set();

    if (userId) {
      const [progressData, bookmarkData] = await Promise.all([
        UserProgress.find({ 
          userId: new mongoose.Types.ObjectId(userId),
          questionId: { $in: questions.map(q => q._id) }
        }).lean(),
        UserBookmark.find({ 
          userId: new mongoose.Types.ObjectId(userId),
          questionId: { $in: questions.map(q => q._id) }
        }).lean()
      ]);

      progressData.forEach(p => userProgress.set(p.questionId.toString(), p));
      bookmarkData.forEach(b => userBookmarks.add(b.questionId.toString()));
    }
    const formattedQuestions = questions.map(q => {
      const category = q.category as any; 
      return {
        id: q._id.toString(),
        questionId: q.questionId,
        title: q.title,
        difficulty: q.difficulty,
        tags: q.tags,
        ytLink: q.ytLink,
        p1Link: q.p1Link,
        p2Link: q.p2Link,
        category: {
          id: category._id.toString(),
          title: category.title,
          slNo: category.slNo
        },
        isCompleted: userProgress.get(q._id.toString())?.isCompleted || false,
        isBookmarked: userBookmarks.has(q._id.toString()),
        createdAt: q.createdAt,
        updatedAt: q.updatedAt
      };
    });

    return {
      questions: formattedQuestions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  public async getCategories() {
    const categories = await Category.find()
      .sort({ slNo: 1 })
      .lean();

    return categories.map(cat => ({
      id: cat._id.toString(),
      title: cat.title,
      slNo: cat.slNo,
      questionCount: cat.questions.length,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt
    }));
  }

  public async getQuestionById(questionId: string, userId?: string) {
    const question = await Question.findById(questionId)
      .populate('category', 'title slNo')
      .lean();

    if (!question) return null;

    let isCompleted = false;
    let isBookmarked = false;

    if (userId) {
      const [progress, bookmark] = await Promise.all([
        UserProgress.findOne({ 
          userId: new mongoose.Types.ObjectId(userId),
          questionId: new mongoose.Types.ObjectId(questionId)
        }),
        UserBookmark.findOne({ 
          userId: new mongoose.Types.ObjectId(userId),
          questionId: new mongoose.Types.ObjectId(questionId)
        })
      ]);

      isCompleted = progress?.isCompleted || false;
      isBookmarked = !!bookmark;
    }

    const category = question.category as any; 
    return {
      id: question._id.toString(),
      questionId: question.questionId,
      title: question.title,
      difficulty: question.difficulty,
      tags: question.tags,
      ytLink: question.ytLink,
      p1Link: question.p1Link,
      p2Link: question.p2Link,
      category: {
        id: category._id.toString(),
        title: category.title,
        slNo: category.slNo
      },
      isCompleted,
      isBookmarked,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    };
  }
}

export default ContentService;