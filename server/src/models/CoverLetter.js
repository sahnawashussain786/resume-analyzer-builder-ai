import mongoose, { Schema } from 'mongoose';

const CoverLetterSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resume: { type: Schema.Types.ObjectId, ref: 'Resume', default: null },
    jobTitle: { type: String, default: '' },
    company: { type: String, default: '' },
    tone: { type: String, default: 'professional', enum: ['professional', 'enthusiastic', 'concise', 'creative', 'formal'] },
    content: { type: String, default: '' },
  },
  { timestamps: true }
);

CoverLetterSchema.index({ user: 1, updatedAt: -1 });

const CoverLetter = mongoose.model('CoverLetter', CoverLetterSchema);
export { CoverLetterSchema, CoverLetter };
