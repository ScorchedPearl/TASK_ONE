import mongoose, { Document, Schema } from 'mongoose';


export interface IUserProgress extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userProgressSchema = new Schema<IUserProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date
}, {
  timestamps: true
});
userProgressSchema.index({ userId: 1, questionId: 1 }, { unique: true });


export const UserProgress = mongoose.model<IUserProgress>('UserProgress', userProgressSchema);