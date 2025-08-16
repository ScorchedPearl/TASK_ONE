import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  _id: string;
  questionId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  ytLink?: string;
  p1Link?: string;
  p2Link?: string;
  category: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  questionId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  tags: [String],
  ytLink: String,
  p1Link: String,
  p2Link: String,
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
}, {
  timestamps: true
});


const Question = mongoose.model<IQuestion>('Question', questionSchema);
export default Question;