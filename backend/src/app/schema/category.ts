import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  _id: string;
  title: string;
  slNo: number;
  questions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  title: {
    type: String,
    required: true,
    unique: true
  },
  slNo: {
    type: Number,
    required: true,
    unique: true
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'Question'
  }]
}, {
  timestamps: true
});

const Category = mongoose.model<ICategory>('Category', categorySchema);
export default Category;