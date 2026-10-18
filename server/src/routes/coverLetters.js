import { Router } from 'express';
import { CoverLetter } from '../models/CoverLetter.js';
import { protect } from '../middleware/auth.js';
import { generateCoverLetter } from '../services/aiService.js';
import { Resume } from '../models/Resume.js';

const router = Router();
router.use(protect);

// POST /api/coverletters/generate — AI writes a cover letter
router.post('/generate', async (req, res, next) => {
  try {
    const { resumeId, resumeData, resumeText, jobTitle, company, jobDescription, tone } = req.body;
    const resume = resumeId ? await Resume.findOne({ _id: resumeId, user: req.user._id }) : null;
    const data = await generateCoverLetter({
      resume: resume || resumeData,
      resumeText,
      jobDescription,
      jobTitle,
      company,
      tone,
    });
    const cl = new CoverLetter({
      user: req.user._id,
      resume: resumeId || undefined,
      jobTitle,
      company,
      tone,
      content: data.content,
    });
    await cl.save();
    res.status(201).json({ coverLetter: cl });
  } catch (err) {
    next(err);
  }
});

// GET /api/coverletters
router.get('/', async (req, res, next) => {
  try {
    const items = await CoverLetter.find({ user: req.user._id }).sort({ updatedAt: -1 }).limit(100);
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// GET /api/coverletters/:id
router.get('/:id', async (req, res, next) => {
  try {
    const cl = await CoverLetter.findOne({ _id: req.params.id, user: req.user._id });
    if (!cl) return res.status(404).json({ message: 'Cover letter not found' });
    res.json(cl);
  } catch (err) {
    next(err);
  }
});

// PUT /api/coverletters/:id (save edits)
router.put('/:id', async (req, res, next) => {
  try {
    const updates = {};
    for (const k of ['jobTitle', 'company', 'tone', 'content']) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }
    const cl = await CoverLetter.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, updates, {
      new: true,
    });
    if (!cl) return res.status(404).json({ message: 'Cover letter not found' });
    res.json(cl);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/coverletters/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await CoverLetter.deleteOne({ _id: req.params.id, user: req.user._id });
    if (!deleted.deletedCount) return res.status(404).json({ message: 'Cover letter not found' });
    res.json({ message: 'Cover letter deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
