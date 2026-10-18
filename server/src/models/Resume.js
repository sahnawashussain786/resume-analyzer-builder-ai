import mongoose, { Schema } from 'mongoose';
import { UserSchema } from './User.js';

const ResumeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, default: 'Untitled Resume', trim: true, maxlength: 80 },
    template: { type: String, default: 'modern', enum: ['modern', 'classic', 'minimal', 'elegant', 'compact'] },
    accentColor: { type: String, default: '#6366f1' },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);

ResumeSchema.index({ user: 1, updatedAt: -1 });

const Resume = mongoose.model('Resume', ResumeSchema);
export { ResumeSchema, Resume };
