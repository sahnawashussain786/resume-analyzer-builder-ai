import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { Analysis } from '../models/Analysis.js';
import { Resume } from '../models/Resume.js';
import { protect } from '../middleware/auth.js';
import { analyzeResume, generateSummary, enhanceBullets, suggestSkills, tailorResume, aiStatus } from '../services/aiService.js';
import { extractText } from '../services/parseService.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'AI rate limit reached (60 requests/hour). Please try again later.' },
});

// GET /api/ai/status
router.get('/status', protect, (req, res) => res.json(aiStatus()));

/* ----------------------------- Analyzer ----------------------------- */

// POST /api/ai/analyze
router.post('/analyze', protect, aiLimiter, async (req, res, next) => {
  try {
    const { resumeText, jobDescription = '', jobTitle = '', jobCompany = '', resumeId = null, resumeName = 'Pasted resume', save = true } = req.body;
    if (!resumeText || resumeText.trim().length < 100)
      return res.status(400).json({ message: 'Provide your resume text (or upload a file with at least ~100 characters).' });

    const result = await analyzeResume({ resumeText, jobDescription, jobTitle });

    let analysis = null;
    if (save) {
      analysis = await Analysis.create({
        user: req.user._id,
        resume: resumeId || undefined,
        resumeName,
        jobTitle: jobTitle || '',
        jobCompany,
        jobDescription: (jobDescription || '').slice(0, 8000),
        resumeText: (resumeText || '').slice(0, 15000),
        result,
      });
    }
    res.json({ analysis, result });
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/analyses
router.get('/analyses', protect, async (req, res, next) => {
  try {
    const analyses = await Analysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('resume resumeName jobTitle jobCompany result.overallScore result.categories createdAt')
      .limit(60);
    res.json(analyses);
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/analyses/:id
router.get('/analyses/:id', protect, async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, user: req.user._id });
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/ai/analyses/:id
router.delete('/analyses/:id', protect, async (req, res, next) => {
  try {
    await Analysis.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Analysis deleted' });
  } catch (err) {
    next(err);
  }
});

/* ----------------------------- Builder AI --------------------------- */

// POST /api/ai/summary
router.post('/summary', protect, aiLimiter, async (req, res, next) => {
  try {
    const { role, yearsExperience, skills, experience, tone } = req.body;
    const data = await generateSummary({ role, yearsExperience, skills, experience, tone });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/enhance-bullets
router.post('/enhance-bullets', protect, aiLimiter, async (req, res, next) => {
  try {
    const { bullets, role, jobDescription } = req.body;
    if (!Array.isArray(bullets) || !bullets.length)
      return res.status(400).json({ message: 'Provide an array of bullets to enhance' });
    const data = await enhanceBullets({ bullets: bullets.slice(0, 10), role, jobDescription });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/suggest-skills
router.post('/suggest-skills', protect, aiLimiter, async (req, res, next) => {
  try {
    const { role, existingSkills = [], jobDescription } = req.body;
    const data = await suggestSkills({ role, existingSkills, jobDescription });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/tailor  — rewrites a stored resume against a job description
router.post('/tailor', protect, aiLimiter, async (req, res, next) => {
  try {
    const { resumeId, jobDescription, jobTitle } = req.body;
    if (!jobDescription || jobDescription.trim().length < 50)
      return res.status(400).json({ message: 'Paste a job description (at least ~50 characters) to tailor against.' });

    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    const result = await tailorResume({ resume: resume.data, jobDescription, jobTitle });

    // Apply tailored summary + bullets to the resume
    if (result.summary) resume.data.summary = result.summary;
    if (Array.isArray(result.experience)) {
      resume.data.experience = (resume.data.experience || []).map((exp) => {
        const match = result.experience.find(
          (t) => t.title === exp.title && t.company === exp.company
        );
        return match && Array.isArray(match.bullets) ? { ...exp, bullets: match.bullets } : exp;
      });
    }
    resume.markModified('data');
    await resume.save();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/* ----------------------------- Upload ------------------------------- */

// POST /api/ai/parse-file (analyze a file upload)
router.post('/parse-file', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const text = await extractText(req.file);
    res.json({ text, name: req.file.originalname, size: req.file.size });
  } catch (err) {
    next(err);
  }
});

export default router;
