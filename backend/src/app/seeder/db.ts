import axios from 'axios';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Question from '../schema/question';
import Category from '../schema/category';

dotenv.config();

interface ApiQuestion {
  id: string;
  tags: string;
  title: string;
  yt_link: string;
  p1_link: string;
  p2_link: string | null;
}

interface ApiCategory {
  sl_no: number;
  title: string;
  ques: ApiQuestion[];
}

interface ApiResponse {
  status: boolean;
  data: ApiCategory[];
}

class DatabaseSeeder {
  private readonly dataUrl = 'https://test-data-gules.vercel.app/data.json';
  
  private getDifficulty(title: string): 'Easy' | 'Medium' | 'Hard' {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('basic') || titleLower.includes('intro') || titleLower.includes('simple')) {
      return 'Easy';
    }
    
    if (titleLower.includes('advanced') || titleLower.includes('complex') || titleLower.includes('hard')) {
      return 'Hard';
    }
    
    return 'Medium';
  }

  private parseTags(tagsString: string): string[] {
    if (!tagsString || tagsString.trim() === '') return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  public async run(): Promise<void> {
    try {
      console.log('Starting database seeding...');

      const mongoUrl = process.env.MONGODB_URL;
      if (!mongoUrl) throw new Error('MONGODB_URL not found');
      await mongoose.connect(mongoUrl);
      console.log('Connected to MongoDB');

      console.log('Fetching data...');
      const response = await axios.get<ApiResponse>(this.dataUrl);
      if (!response.data || !response.data.status) throw new Error('Invalid API response');

      await Question.deleteMany({});
      await Category.deleteMany({});
      console.log('Cleared existing data');

      for (const categoryData of response.data.data) {
        const category = new Category({
          title: categoryData.title,
          slNo: categoryData.sl_no,
          questions: []
        });
        const savedCategory = await category.save();

        const questionIds = [];
        for (const questionData of categoryData.ques) {
          try {
            const question = new Question({
              questionId: questionData.id,
              title: questionData.title,
              difficulty: this.getDifficulty(questionData.title),
              tags: this.parseTags(questionData.tags),
              ytLink: questionData.yt_link || undefined,
              p1Link: questionData.p1_link || undefined,
              p2Link: questionData.p2_link || undefined,
              category: savedCategory._id
            });

            const savedQuestion = await question.save();
            questionIds.push(savedQuestion._id);
          } catch (error: any) {
            if (error.code !== 11000) {
              console.warn(`Failed to create question: ${questionData.title}`);
            }
          }
        }

       
        await Category.findByIdAndUpdate(savedCategory._id, {
          questions: questionIds
        });

        console.log(`Created category: ${categoryData.title} (${questionIds.length} questions)`);
      }

      const [totalCategories, totalQuestions] = await Promise.all([
        Category.countDocuments(),
        Question.countDocuments()
      ]);

      console.log('\nSeeding completed!');
      console.log(`Categories: ${totalCategories}`);
      console.log(`Questions: ${totalQuestions}`);

    } catch (error) {
      console.error('Seeding failed:', error);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
      process.exit(0);
    }
  }
}

if (require.main === module) {
  const seeder = new DatabaseSeeder();
  seeder.run();
}

export default DatabaseSeeder;