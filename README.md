# ResumeForge — AI Resume Builder & ATS Analyzer

A full **MERN stack** web app: build beautiful resumes with AI, score them against any job
description with an ATS analyzer, tailor them to a job in one click, and generate matching
AI cover letters.

![stack](https://img.shields.io/badge/stack-MongoDB%20·%20Express%20·%20React%20·%20Node-6366f1)
![ui](https://img.shields.io/badge/UI-TailwindCSS%20·%20lucide--react%20·%20framer--motion-f43f5e)

## ✨ Features

| Area | What you get |
| --- | --- |
| **AI Resume Builder** | Section-by-section editor, live A4 preview, autosave, 5 templates, accent colors, one-click PDF export (print dialog → Save as PDF), copy as plain text |
| **AI writing tools** | Professional summary generator (5 tones), bullet-point enhancer, AI skill suggestions |
| **ATS Resume Analyzer** | Upload PDF/DOCX/TXT or paste text + optional job description → honest ATS score with 5-category breakdown, matched/missing keywords, strengths/weaknesses, priority-ranked quick fixes, AI-improved summary, recruiter tip |
| **Job tailoring** | One click rewrites your summary + bullets to mirror a job description (history stays intact) |
| **AI Cover Letters** | Personalized letters from your resume + the posting, 5 tones, built-in editor, copy |
| **Dashboard** | Resume/analysis/cover-letter counts, average & best ATS score, score trend chart, recent activity |
| **Everything else** | JWT auth (register/login/profile/password/delete), dark mode, analysis history with permalinks, settings, rate-limited AI endpoints, fully responsive |

## 🚀 Quick start

```bash
npm run install-all        # installs root, server and client deps
npm run server             # API on http://localhost:5000
npm run client             # Web on http://localhost:5173
```

The app runs out of the box: with no keys configured it uses an **in-memory MongoDB** and **mock AI**, so you can register an account and try every feature immediately.

### Enable real AI + persistent DB

Edit `server/.env`:

```ini
OPENAI_API_KEY=sk-...          # live AI
AI_MOCK=false
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/resumeforge?retryWrites=true&w=majority
```

Then restart the API. Model is configurable via `OPENAI_MODEL` (default `gpt-4o-mini`).

## 🗂 Structure

```
├── server/               Express + Mongoose API
│   └── src/
│       ├── routes/       auth, resumes, ai (analyze/summary/enhance/tailor/parse),
│       │                 coverLetters, dashboard
│       ├── services/     aiService (OpenAI + deterministic mock fallback), parseService
│       ├── models/       User, Resume, Analysis, CoverLetter
│       └── middleware/   JWT protect, error handler
└── client/               React 19 + Vite + Tailwind v4
    └── src/
        ├── pages/        Landing, Login, Register, Dashboard, Builder, Analyzer,
        │                 AnalysisDetail, CoverLetters, Templates, Settings
        ├── components/   ui primitives, Navbar, Footer, resume preview (5 templates)
        └── utils/        resume data model, sample data, plain-text export
```

## 🔌 API overview

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` `/api/auth/login` | JWT auth |
| GET/PUT | `/api/auth/me` `/profile` `/password` | account |
| CRUD | `/api/resumes` (+ `/duplicate`) | resumes |
| POST | `/api/ai/analyze` | ATS analysis (saved to history) |
| GET/DELETE | `/api/ai/analyses[/:id]` | analysis history |
| POST | `/api/ai/summary` `/enhance-bullets` `/suggest-skills` | builder AI tools |
| POST | `/api/ai/tailor` | rewrite resume against a JD |
| POST | `/api/ai/parse-file` | PDF/DOCX/TXT → text |
| POST | `/api/coverletters/generate` | AI cover letter |
| GET | `/api/dashboard/stats` | dashboard aggregates |

AI endpoints are rate-limited to 60 req/hour.

## 📄 PDF export

Click **Download PDF** in the builder — the browser print dialog opens with a print-perfect,
text-selectable A4 rendering (choose *Save as PDF*).
