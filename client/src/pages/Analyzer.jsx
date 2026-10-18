import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ScanLine,
  Upload,
  FileText,
  Sparkles,
  History,
  Trash2,
  ArrowRight,
  Target,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Plus,
  TrendingUp,
  Quote,
  Copy,
  Check,
} from 'lucide-react';
import { api, errMsg } from '../api/client.js';
import { extractPdfText } from '../utils/pdfText.js';
import Navbar from '../components/Navbar.jsx';
import { Badge, Button, Card, EmptyState, Field, Input, ScoreRing, Textarea, Modal } from '../components/ui.jsx';
import Spinner from '../components/Spinner.jsx';
import { scoreTone } from '../utils/resume.js';

function CategoryBars({ categories }) {
  return (
    <div className="space-y-4">
      {(categories || []).map((c) => {
        const color = c.score >= 80 ? 'bg-emerald-500' : c.score >= 60 ? 'bg-amber-500' : 'bg-rose-500';
        return (
          <div key={c.name}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{c.name}</p>
              <span className={`text-sm font-extrabold ${c.score >= 80 ? 'text-emerald-500' : c.score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>{c.score}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${c.score}%` }} />
            </div>
            {c.comment && <p className="mt-1 text-[11.5px] leading-snug text-slate-400">{c.comment}</p>}
          </div>
        );
      })}
    </div>
  );
}

const prioTone = { high: 'rose', medium: 'amber', low: 'slate' };

export function AnalysisResult({ result, onOpenHistory }) {
  const [copied, setCopied] = useState(false);
  if (!result) return null;
  const score = result.overallScore ?? 0;

  const copySummary = async () => {
    await navigator.clipboard.writeText(result.improvedSummary || '');
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Score header */}
      <Card className="flex flex-col items-center gap-6 sm:flex-row">
        <ScoreRing score={score} size={140} label="ATS score" />
        <div className="flex-1 text-center sm:text-left">
          <Badge tone={scoreTone(score)} className="text-xs">
            {score >= 80 ? 'Strong candidate material' : score >= 60 ? 'Decent — needs polish' : 'Needs real work before applying'}
          </Badge>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <strong className="text-slate-800 dark:text-white">Recruiter tip:</strong> {result.recruiterTip}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-slate-800"><CheckCircle2 size={12} className="mr-1 inline text-emerald-500" />{result.matchedKeywords?.length || 0} keywords matched</span>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-slate-800"><AlertTriangle size={12} className="mr-1 inline text-amber-500" />{result.missingKeywords?.length || 0} to add</span>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-slate-800"><Lightbulb size={12} className="mr-1 inline text-brand-500" />{result.quickFixes?.length || 0} quick fixes</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Categories */}
        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"><TrendingUp size={16} className="text-brand-500" /> Score breakdown</h3>
          <CategoryBars categories={result.categories} />
        </Card>

        {/* Missing keywords + strengths/weaknesses */}
        <div className="space-y-4">
          {result.missingKeywords?.length > 0 && (
            <Card>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <Target size={15} className="text-amber-500" /> Missing keywords
                <Badge tone="amber" className="ml-auto">add these</Badge>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords.map((k) => <Badge key={k} tone="amber" className="text-xs">{k}</Badge>)}
              </div>
            </Card>
          )}
          {result.matchedKeywords?.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">Keywords you already cover</h3>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedKeywords.map((k) => <Badge key={k} tone="green" className="text-xs"><CheckCircle2 size={11} /> {k}</Badge>)}
              </div>
            </Card>
          )}
          {result.improvedSummary && (
            <Card>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"><Sparkles size={15} className="text-fuchsia-500" /> AI-improved summary</h3>
                <Button size="sm" variant="ghost" onClick={copySummary}>{copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />} Copy</Button>
              </div>
              <p className="rounded-xl bg-brand-50 p-3.5 text-[12.5px] leading-relaxed text-slate-700 dark:bg-brand-500/10 dark:text-slate-200">{result.improvedSummary}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Quick fixes */}
      {result.quickFixes?.length > 0 && (
        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"><Lightbulb size={16} className="text-amber-500" /> Quick fixes (priority order)</h3>
          <div className="space-y-2.5">
            {result.quickFixes.map((f, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3.5 sm:flex-row sm:items-start dark:border-slate-800">
                <Badge tone={prioTone[f.priority] || 'slate'} className="shrink-0 self-start uppercase">{f.priority}</Badge>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{f.title}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-500 dark:text-slate-400">{f.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-bold text-emerald-600 dark:text-emerald-400">Strengths</h3>
          <ul className="space-y-2">
            {(result.strengths || []).map((s, i) => <li key={i} className="flex gap-2 text-[12.5px] text-slate-600 dark:text-slate-300"><CheckCircle2 size={14} className="shrink-0 text-emerald-500" />{s}</li>)}
          </ul>
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-bold text-rose-600 dark:text-rose-400">Weaknesses</h3>
          <ul className="space-y-2">
            {(result.weaknesses || []).map((s, i) => <li key={i} className="flex gap-2 text-[12.5px] text-slate-600 dark:text-slate-300"><AlertTriangle size={14} className="shrink-0 text-rose-400" />{s}</li>)}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ */

export default function Analyzer() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTab = location.pathname.endsWith('/history') ? 'history' : 'new';
  const [tab, setTab] = useState(initialTab);

  const [mode, setMode] = useState('paste'); // paste | upload
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [jd, setJd] = useState({ jobTitle: '', jobCompany: '', jobDescription: '' });
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [error, setError] = useState('');

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => setTab(initialTab), [initialTab]);

  useEffect(() => {
    if (tab === 'history' && !history.length) {
      setLoadingHistory(true);
      api.get('/ai/analyses')
        .then(({ data }) => setHistory(data))
        .catch((e) => setError(errMsg(e)))
        .finally(() => setLoadingHistory(false));
    }
  }, [tab]);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setParsing(true); setError('');
    try {
      const name = f.name.toLowerCase();
      if (name.endsWith('.pdf') || f.type === 'application/pdf') {
        // Extract client-side with modern pdf.js — reliable on any PDF
        const text = await extractPdfText(f);
        if (!text || text.trim().length < 60) {
          throw new Error('No selectable text found in this PDF — it may be a scan/image. Paste the text manually instead.');
        }
        setResumeText(text);
      } else {
        // DOCX / TXT handled server-side
        const fd = new FormData();
        fd.append('file', f);
        const { data } = await api.post('/ai/parse-file', fd);
        setResumeText(data.text);
      }
      setMode('upload');
    } catch (err) {
      setError(err?.normalizedMessage || err.message || errMsg(err));
      setFileName('');
    } finally { setParsing(false); }
  };

  const analyze = async () => {
    setError('');
    if (mode === 'paste' && resumeText.trim().length < 100) {
      setError('Paste your resume text (at least ~100 characters) or upload a file.');
      return;
    }
    setAnalyzing(true);
    try {
      const { data } = await api.post('/ai/analyze', {
        resumeText,
        jobDescription: jd.jobDescription,
        jobTitle: jd.jobTitle,
        jobCompany: jd.jobCompany,
        resumeName: fileName || 'Pasted resume',
      });
      setResult(data.result);
      setAnalysisId(data.analysis?._id);
    } catch (e) { setError(errMsg(e)); }
    finally { setAnalyzing(false); }
  };

  const deleteAnalysis = async (id) => {
    await api.delete(`/ai/analyses/${id}`);
    setHistory((h) => h.filter((a) => a._id !== id));
  };

  const openPreview = async (id) => {
    const { data } = await api.get(`/ai/analyses/${id}`);
    setPreview(data);
  };

  const canAnalyze = mode === 'upload' ? resumeText.trim().length >= 100 : resumeText.trim().length >= 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
              <ScanLine size={24} className="mr-2 inline text-brand-500" /> ATS Resume Analyzer
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Score your resume against any job description before recruiters do.</p>
          </div>
          <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {[['new', 'New analysis'], ['history', 'History']].map(([k, label]) => (
              <button key={k} onClick={() => (k === 'history' ? navigate('/analyzer/history') : navigate('/analyzer'))}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${tab === k ? 'bg-white text-brand-700 shadow dark:bg-slate-900 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{error}</p>}

        {tab === 'new' && (
          <>
            {/* Input card */}
            <Card>
              <div className="grid gap-5 lg:grid-cols-2">
                {/* Resume input */}
                <div>
                  <div className="mb-3 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                    {[['paste', 'Paste text'], ['upload', 'Upload file']].map(([m, label]) => (
                      <button key={m} onClick={() => setMode(m)}
                        className={`rounded-lg py-2 text-sm font-bold ${mode === m ? 'bg-white shadow dark:bg-slate-900' : 'text-slate-500'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {mode === 'paste' && (
                    <Textarea rows={9} value={resumeText} onChange={(e) => { setResumeText(e.target.value); setFileName(''); }}
                      placeholder="Paste your full resume text here (from any editor or PDF export)…" />
                  )}
                  {mode === 'upload' && (
                    <label className="flex h-[210px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 transition hover:border-brand-400 hover:bg-brand-50/30 dark:border-slate-700 dark:hover:border-brand-500">
                      <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={onFile} />
                      {parsing ? <Spinner /> : fileName ? (
                        <>
                          <FileText size={34} className="text-brand-500" />
                          <p className="mt-2 max-w-[80%] truncate text-sm font-bold text-slate-700 dark:text-slate-200">{fileName}</p>
                          <p className="text-[11px] text-slate-400">{resumeText.length.toLocaleString()} characters extracted — click to replace</p>
                        </>
                      ) : (
                        <>
                          <Upload size={34} className="text-slate-400" />
                          <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">Drop or select a PDF / DOCX / TXT</p>
                          <p className="text-[11px] text-slate-400">max 4 MB — text is extracted in your browser's request</p>
                        </>
                      )}
                    </label>
                  )}
                  {resumeText && mode === 'upload' && (
                    <button onClick={() => setMode('paste')} className="mt-2 text-xs font-semibold text-brand-600 dark:text-brand-400">
                      Preview extracted text →
                    </button>
                  )}
                </div>

                {/* JD input */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Job title"><Input value={jd.jobTitle} placeholder="e.g. Backend Engineer" onChange={(e) => setJd({ ...jd, jobTitle: e.target.value })} /></Field>
                    <Field label="Company (optional)"><Input value={jd.jobCompany} placeholder="e.g. Google" onChange={(e) => setJd({ ...jd, jobCompany: e.target.value })} /></Field>
                  </div>
                  <Field label="Job description">
                    <Textarea rows={7} value={jd.jobDescription} placeholder="Paste the job posting here… (optional but strongly recommended — it's what makes the score meaningful)"
                      onChange={(e) => setJd({ ...jd, jobDescription: e.target.value })} />
                  </Field>
                </div>
              </div>
              <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <p className="text-[11px] text-slate-400">Without a job description you'll get generic best-practice scoring.</p>
                <Button size="lg" variant="gradient" loading={analyzing} disabled={!canAnalyze || analyzing} onClick={analyze} className="w-full sm:w-auto">
                  <ScanLine size={18} /> Analyze my resume
                </Button>
              </div>
            </Card>

            {/* Result */}
            <div className="mt-6">
              {analyzing ? (
                <Card><Spinner full label="AI is scoring your resume…" /></Card>
              ) : result ? (
                <div className="space-y-4">
                  <AnalysisResult result={result} />
                  <div className="flex flex-wrap gap-3">
                    <Link to="/builder"><Button variant="outline"><Plus size={15} /> Apply fixes in the Builder</Button></Link>
                    {analysisId && <Button variant="ghost" onClick={() => navigate(`/analyzer/${analysisId}`)}><ArrowRight size={15} /> Permalink to this analysis</Button>}
                  </div>
                </div>
              ) : (
                <EmptyState icon={Quote} title="Ready when you are" description="Paste or upload a resume, optionally add a job description, and get your instant ATS score with a fix-it list." />
              )}
            </div>
          </>
        )}

        {tab === 'history' && (
          loadingHistory ? <Spinner full label="Loading history…" /> : history.length ? (
            <div className="space-y-3">
              {history.map((a) => (
                <Card key={a._id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-800 dark:text-slate-100">{a.jobTitle || a.resumeName}</p>
                    <p className="truncate text-xs text-slate-400">{[a.jobCompany, new Date(a.createdAt).toLocaleString()].filter(Boolean).join(' · ')}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-lg px-2.5 py-1 text-sm font-extrabold ${
                      (a.result?.overallScore ?? 0) >= 80 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : (a.result?.overallScore ?? 0) >= 60 ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'}`}>
                      {a.result?.overallScore ?? '—'}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/analyzer/${a._id}`)} title="Open details"><ArrowRight size={15} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteAnalysis(a._id)} title="Delete"><Trash2 size={15} className="text-rose-500" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState icon={History} title="No analyses yet" description="Run your first analysis to start tracking your ATS score over time."
              action={<Button onClick={() => navigate('/analyzer')}><ScanLine size={16} /> Analyze now</Button>} />
          )
        )}
      </main>

      {/* Full analysis preview (from history quick view) */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.jobTitle || preview?.resumeName || 'Analysis'} wide>
        {preview && <AnalysisResult result={preview.result} />}
      </Modal>
    </div>
  );
}
