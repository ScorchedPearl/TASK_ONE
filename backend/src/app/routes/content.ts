import { Router, Request, Response } from 'express';
import ContentService from '../services/contentservice';
import UserProgressService from '../services/progressservice';
import AuthMiddleware from '../middleware/auth';

const contentRouter = Router();
const contentService = ContentService.getInstance();
const userProgressService = UserProgressService.getInstance();
const authMiddleware = AuthMiddleware.getInstance();

contentRouter.get('/', authMiddleware.optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const {
      search,
      difficulty,
      category,
      sortBy = 'title',
      page = '1',
      limit = '20'
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page as string, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));

    const options = {
      search: search as string,
      difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
      category: category as string,
      sortBy: sortBy as string,
      page: parsedPage,
      limit: parsedLimit
    };

    const userId = req.user?.id;
    const result = await contentService.getContent(options, userId);

    res.json({
      success: true,
      data: result,
      message: 'Content retrieved successfully'
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content'
    });
  }
});

contentRouter.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await contentService.getCategories();
    res.json({
      success: true,
      data: { categories },
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

contentRouter.get('/questions/:questionId', authMiddleware.optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const userId = req.user?.id ?? '';

    if (!questionId) {
      return res.status(400).json({
        success: false,
        error: 'Question ID is required'
      });
    }

    const question = await contentService.getQuestionById(questionId, userId);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: { question },
      message: 'Question retrieved successfully'
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch question'
    });
  }
});


contentRouter.post('/user/progress', authMiddleware.authenticate, async (req: Request, res: Response) => {
  try {
    const { questionId, isCompleted } = req.body;
    const userId = req.user!.id;

    if (!questionId || typeof isCompleted !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Question ID and completion status are required'
      });
    }

    const progress = await userProgressService.updateProgress(userId, questionId, isCompleted);

    res.json({
      success: true,
      data: { progress },
      message: 'Progress updated successfully'
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Question not found') {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update progress'
    });
  }
});


contentRouter.get('/user/progress', authMiddleware.authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const stats = await userProgressService.getProgressStats(userId);

    res.json({
      success: true,
      data: { stats },
      message: 'Progress statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress statistics'
    });
  }
});


contentRouter.post('/user/bookmarks', authMiddleware.authenticate, async (req: Request, res: Response) => {
  try {
    const { questionId } = req.body;
    const userId = req.user!.id;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        error: 'Question ID is required'
      });
    }

    const bookmark = await userProgressService.addBookmark(userId, questionId);

    res.json({
      success: true,
      data: { bookmark },
      message: 'Bookmark added successfully'
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Question not found') {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    console.error('Add bookmark error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add bookmark'
    });
  }
});


contentRouter.get('/user/bookmarks', authMiddleware.authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = '1', limit = '20' } = req.query;

    const parsedPage = Math.max(1, parseInt(page as string, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));

    const result = await userProgressService.getUserBookmarks(userId, parsedPage, parsedLimit);

    res.json({
      success: true,
      data: result,
      message: 'Bookmarks retrieved successfully'
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookmarks'
    });
  }
});

contentRouter.delete('/user/bookmarks/:questionId', authMiddleware.authenticate, async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const userId = req.user!.id;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        error: 'Question ID is required'
      });
    }

    const removed = await userProgressService.removeBookmark(userId, questionId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'Bookmark not found'
      });
    }

    res.json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove bookmark'
    });
  }
});

export default contentRouter;