import { Router } from 'express';
import { Resume } from '../models/Resume.js';
import { Analysis } from '../models/Analysis.js';
import { CoverLetter } from '../models/CoverLetter.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/stats', async (req, res, next) => {
  try {
    const [resumes, analyses, coverLetters] = await Promise.all([
      Resume.find({ user: req.user._id }).sort({ updatedAt: -1 }).limit(3),
      Analysis.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(60),
      CoverLetter.find({ user: req.user._id }).sort({ updatedAt: -1 }).limit(3),
    ]);

    const scores = analyses.map((a) => a.result?.overallScore).filter((s) => typeof s === 'number');
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const bestScore = scores.length ? Math.max(...scores) : null;

    // score trend: oldest -> newest for charting
    const trend = analyses
      .slice(0, 20)
      .reverse()
      .map((a) => ({
        date: a.createdAt,
        score: a.result?.overallScore ?? null,
        label: a.jobTitle || a.resumeName || 'Analysis',
      }));

    res.json({
      counts: {
        resumes: await Resume.countDocuments({ user: req.user._id }),
        analyses: await Analysis.countDocuments({ user: req.user._id }),
        coverLetters: await CoverLetter.countDocuments({ user: req.user._id }),
      },
      avgScore,
      bestScore,
      trend,
      recentResumes: resumes.map((r) => ({ _id: r._id, title: r.title, template: r.template, updatedAt: r.updatedAt })),
      recentCoverLetters: coverLetters.map((c) => ({ _id: c._id, jobTitle: c.jobTitle, company: c.company, updatedAt: c.updatedAt })),
      recentAnalyses: analyses.slice(0, 5).map((a) => ({
        _id: a._id,
        resumeName: a.resumeName,
        jobTitle: a.jobTitle,
        jobCompany: a.jobCompany,
        score: a.result?.overallScore,
        createdAt: a.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
