import { Router } from 'express';
import { Resume } from '../models/Resume.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// GET /api/resumes
router.get('/', async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (err) {
    next(err);
  }
});

// POST /api/resumes
router.post('/', async (req, res, next) => {
  try {
    const { title, template, accentColor, data } = req.body;
    const resume = await Resume.create({
      user: req.user._id,
      title: title || 'Untitled Resume',
      template,
      accentColor,
      data: data || {},
    });
    res.status(201).json(resume);
  } catch (err) {
    next(err);
  }
});

// GET /api/resumes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch (err) {
    next(err);
  }
});

// PUT /api/resumes/:id
router.put('/:id', async (req, res, next) => {
  try {
    const updates = {};
    for (const k of ['title', 'template', 'accentColor', 'data']) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }
    if (updates.data) {
      updates.$set = { [`data`]: updates.data };
      delete updates.data;
    }
    const resume = await Resume.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, updates, {
      new: true,
      runValidators: true,
    });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch (err) {
    next(err);
  }
});

// POST /api/resumes/:id/duplicate
router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const source = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!source) return res.status(404).json({ message: 'Resume not found' });
    const copy = await Resume.create({
      user: req.user._id,
      title: `${source.title} (copy)`,
      template: source.template,
      accentColor: source.accentColor,
      data: source.data,
    });
    res.status(201).json(copy);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/resumes/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Resume.deleteOne({ _id: req.params.id, user: req.user._id });
    if (!deleted.deletedCount) return res.status(404).json({ message: 'Resume not found' });
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
