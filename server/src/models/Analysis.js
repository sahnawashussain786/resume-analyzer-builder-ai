import mongoose, { Schema } from 'mongoose';

const AnalysisSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resume: { type: Schema.Types.ObjectId, ref: 'Resume', default: null },
    resumeName: { type: String, default: 'Pasted resume' },
    jobTitle: { type: String, default: '' },
    jobCompany: { type: String, default: '' },
    jobDescription: { type: String, default: '' },
    resumeText: { type: String, default: '' },
    result: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

AnalysisSchema.index({ user: 1, createdAt: -1 });

const Analysis = mongoose.model('Analysis', AnalysisSchema);
export { AnalysisSchema, Analysis };
