import mongoose, { Document, Schema } from 'mongoose';

export interface IUserBookmark extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}


const userBookmarkSchema = new Schema<IUserBookmark>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  }
}, {
  timestamps: true
});
userBookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });
export const UserBookmark = mongoose.model<IUserBookmark>('UserBookmark', userBookmarkSchema);