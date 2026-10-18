import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  Download,
  Copy,
  Wand2,
  Sparkles,
  Target,
  Check,
  FileText,
  Eye,
  PenLine,
  Palette,
  LayoutTemplate,
  Loader2,
  Trash2,
  ChevronLeft,
  Briefcase,
  GraduationCap,
  ListChecks,
  FolderGit2,
  BadgeCheck,
  Languages,
} from "lucide-react";
import { api, errMsg } from "../api/client.js";
import Navbar from "../components/Navbar.jsx";
import Spinner from "../components/Spinner.jsx";
import {
  Button,
  Card,
  Modal,
  Badge,
  EmptyState,
  AiBadge,
  Field,
  Label,
  Textarea,
  Input,
} from "../components/ui.jsx";
import ResumePreview, { FitBox } from "../components/resume/ResumePreview.jsx";
import {
  SectionCard,
  BasicsEditor,
  SummaryEditor,
  ExperienceEditor,
  EducationEditor,
  SkillsEditor,
  ProjectsEditor,
  CertsEditor,
  LanguagesEditor,
} from "../components/builder/Editors.jsx";
import {
  emptyResume,
  sampleResume,
  TEMPLATES,
  ACCENT_COLORS,
  resumeToPlainText,
} from "../utils/resume.js";

export default function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null); // { _id, title, template, accentColor, data }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState("saved"); // saved | saving | dirty
  const [mobileTab, setMobileTab] = useState("edit"); // edit | preview

  // AI state
  const [generating, setGenerating] = useState(false);
  const [enhancingIdx, setEnhancingIdx] = useState(null);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [taillorOpen, setTaillorOpen] = useState(false);
  const [jd, setJd] = useState({ jobTitle: "", jobDescription: "" });
  const [tailoring, setTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState(null);

  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  const firstLoad = useRef(true);

  /* ------------------------------ data load ----------------------------- */

  useEffect(() => {
    if (id) {
      api
        .get(`/resumes/${id}`)
        .then(({ data }) => {
          setResume({ ...data, data: { ...emptyResume(), ...data.data } });
        })
        .catch((e) => setError(errMsg(e)))
        .finally(() => setLoading(false));
    } else {
      setResume({
        title: "Untitled Resume",
        template: "modern",
        accentColor: "#6366f1",
        data: emptyResume(),
      });
      setSaveState("dirty");
      setLoading(false);
    }
  }, [id]);

  /* ------------------------------ autosave ------------------------------ */

  const persist = useCallback(async (payload) => {
    setSaveState("saving");
    try {
      if (payload._id) {
        const { data } = await api.put(`/resumes/${payload._id}`, payload);
        setResume((r) => ({ ...r, ...data, data: r.data }));
      } else {
        // create first time we have something to save
        const { data } = await api.post("/resumes", {
          title: payload.title,
          template: payload.template,
          accentColor: payload.accentColor,
          data: payload.data,
        });
        window.history.replaceState(null, "", `/builder/${data._id}`);
        setResume({ ...data });
      }
      setSaveState("saved");
    } catch (e) {
      setError(errMsg(e));
      setSaveState("dirty");
    }
  }, []);

  useEffect(() => {
    if (!resume || saveState !== "dirty") return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => persist(resume), 1200);
    return () => clearTimeout(timer.current);
  }, [resume, saveState, persist]);

  const touch = (next) => {
    firstLoad.current = false;
    setSaveState("dirty");
    setResume(next);
  };

  /* ---------------------------- AI operations --------------------------- */

  const generateSummary = async (tone) => {
    setGenerating(true);
    setError("");
    try {
      const d = resume.data || {};
      const { data } = await api.post("/ai/summary", {
        role: d.basics?.jobTitle,
        yearsExperience: undefined,
        skills: (d.skills || []).map((s) => s.name).join(", "),
        experience: (d.experience || [])
          .map(
            (e) =>
              `${e.title} at ${e.company}: ${(e.bullets || []).join("; ")}`,
          )
          .join("\n"),
        tone,
      });
      touch({ ...resume, data: { ...d, summary: data.summary } });
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setGenerating(false);
    }
  };

  const enhanceBullets = async (idx) => {
    setEnhancingIdx(idx);
    setError("");
    try {
      const exp = [...resume.data.experience];
      const { data } = await api.post("/ai/enhance-bullets", {
        bullets: exp[idx].bullets || [],
        role: resume.data?.basics?.jobTitle,
      });
      if (Array.isArray(data.bullets)) {
        exp[idx] = {
          ...exp[idx],
          bullets: data.bullets.slice(
            0,
            Math.max(data.bullets.length, exp[idx].bullets.length),
          ),
        };
        touch({ ...resume, data: { ...resume.data, experience: exp } });
      }
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setEnhancingIdx(null);
    }
  };

  const suggestSkills = async () => {
    setSuggesting(true);
    setError("");
    try {
      const { data } = await api.post("/ai/suggest-skills", {
        role: resume.data?.basics?.jobTitle,
        existingSkills: (resume.data?.skills || []).map((s) => s.name),
      });
      setSuggestions(data.skills || []);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSuggesting(false);
    }
  };

  const addSuggestion = (s) => {
    touch({
      ...resume,
      data: {
        ...resume.data,
        skills: [
          ...(resume.data.skills || []),
          { name: s.name, level: "Intermediate" },
        ],
      },
    });
    setSuggestions((prev) => prev.filter((x) => x.name !== s.name));
  };

  const tailor = async () => {
    setTailoring(true);
    setError("");
    try {
      // ensure resume exists server-side before tailoring
      let target = resume;
      if (!resume._id) {
        const created = await api.post("/resumes", {
          title: resume.title,
          template: resume.template,
          accentColor: resume.accentColor,
          data: resume.data,
        });
        target = created.data;
        window.history.replaceState(null, "", `/builder/${target._id}`);
        setResume({ ...target });
      }
      const { data } = await api.post("/ai/tailor", {
        resumeId: target._id,
        jobDescription: jd.jobDescription,
        jobTitle: jd.jobTitle || target.data?.basics?.jobTitle,
      });
      setTailorResult(data);
      // load server-updated resume
      const fresh = await api.get(`/resumes/${target._id}`);
      setResume({
        ...fresh.data,
        data: { ...emptyResume(), ...fresh.data.data },
      });
      setSaveState("saved");
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setTailoring(false);
    }
  };

  /* ------------------------------- actions ------------------------------ */

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(resumeToPlainText(resume.data));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <Spinner full label="Loading resume…" />
      </div>
    );

  if (error && !resume) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-16">
          <EmptyState
            icon={Wand2}
            title="Couldn't load resume"
            description={error}
            action={
              <Button onClick={() => navigate("/dashboard")}>
                Back to dashboard
              </Button>
            }
          />
        </main>
      </div>
    );
  }

  const d = resume?.data || {};

  return (
    <div className="min-h-screen bg-slate-50 pb-24 dark:bg-slate-950">
      <Navbar />

      {/* Print-only full resume */}
      <div id="print-area" aria-hidden="true" style={{ display: "none" }}>
        <ResumePreview
          data={d}
          template={resume.template}
          accent={resume.accentColor}
        />
      </div>

      {/* Toolbar */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
          <ChevronLeft
            size={18}
            className="hidden cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-white sm:block ml-0 order-first"
            onClick={() => navigate("/dashboard")}
          />

          <input
            value={resume.title}
            onChange={(e) => touch({ ...resume, title: e.target.value })}
            className="min-w-0 flex-1 truncate rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-base font-bold text-slate-800 outline-none transition hover:border-slate-200 focus:border-brand-400 focus:bg-white dark:text-white dark:hover:border-slate-700 dark:focus:bg-slate-900 sm:max-w-xs"
          />

          <span className="hidden items-center gap-1 text-[11px] font-semibold text-slate-400 sm:flex">
            {saveState === "saved" && (
              <>
                <Check size={13} className="text-emerald-500" /> Saved
              </>
            )}
            {saveState === "saving" && (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving…
              </>
            )}
            {saveState === "dirty" && (
              <>
                <Save size={13} className="text-amber-500" /> Unsaved
              </>
            )}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-1.5 md:flex">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  title={t.name}
                  onClick={() => touch({ ...resume, template: t.id })}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${resume.template === t.id ? "bg-brand-600 text-white shadow" : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <div className="hidden items-center gap-1 md:flex">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  title={c.name}
                  onClick={() => touch({ ...resume, accentColor: c.value })}
                  className={`h-5 w-5 rounded-full border-2 transition ${resume.accentColor === c.value ? "border-slate-800 scale-110 dark:border-white" : "border-transparent"}`}
                  style={{ background: c.value }}
                />
              ))}
            </div>
            <Button
              size="md"
              variant="gradient"
              onClick={() => setTaillorOpen(true)}
              title="Tailor to a job description"
            >
              <Target size={15} />
              <span className="hidden sm:inline">Tailor to job</span>
            </Button>
            <Button
              size="md"
              variant="secondary"
              onClick={copyText}
              title="Copy as plain text"
            >
              {copied ? (
                <Check size={15} className="text-emerald-500" />
              ) : (
                <Copy size={15} />
              )}
            </Button>
            <Button size="md" onClick={() => window.print()}>
              <Download size={15} />{" "}
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
            {/* Template & color pickers on mobile */}
            <details className="md:hidden">
              <summary className="flex cursor-pointer items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-2 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <Palette size={14} />
              </summary>
              <div className="absolute right-4 z-20 mt-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-wrap gap-1">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => touch({ ...resume, template: t.id })}
                      className={`rounded-lg px-2 py-1 text-xs font-bold ${resume.template === t.id ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => touch({ ...resume, accentColor: c.value })}
                      className={`h-6 w-6 rounded-full ${resume.accentColor === c.value ? "ring-2 ring-offset-2 ring-slate-800 dark:ring-white dark:ring-offset-slate-900" : ""}`}
                      style={{ background: c.value }}
                    />
                  ))}
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      {error && (
        <p className="mx-auto mt-3 max-w-3xl rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </p>
      )}

      {/* Main workspace */}
      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
        {/* Editor column */}
        <div
          className={`${mobileTab === "edit" ? "" : "hidden lg:block"} space-y-4`}
        >
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => touch({ ...resume, data: sampleResume() })}
            >
              <Sparkles size={14} /> Load sample data
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              onClick={() => {
                if (confirm("Clear all resume content?"))
                  touch({ ...resume, data: emptyResume() });
              }}
            >
              <Trash2 size={14} /> Clear all
            </Button>
          </div>

          <SectionCard icon={FileText} title="Personal details">
            <BasicsEditor
              resume={d}
              setResume={(data) => touch({ ...resume, data })}
            />
          </SectionCard>

          <SectionCard
            icon={Wand2}
            title="Professional summary"
            badge={<AiBadge />}
          >
            <SummaryEditor
              resume={d}
              setResume={(data) => touch({ ...resume, data })}
              onGenerate={generateSummary}
              generating={generating}
            />
          </SectionCard>

          <SectionCard
            icon={Briefcase}
            title="Work experience"
            count={d.experience?.length}
            badge={<AiBadge />}
          >
            <ExperienceEditor
              resume={d}
              setResume={(data) => touch({ ...resume, data })}
              onEnhance={enhanceBullets}
              enhancingIdx={enhancingIdx}
            />
          </SectionCard>

          <SectionCard
            icon={GraduationCap}
            title="Education"
            count={d.education?.length}
          >
            <EducationEditor
              resume={d}
              setResume={(data) => touch({ ...resume, data })}
            />
          </SectionCard>

          <SectionCard
            icon={ListChecks}
            title="Skills"
            count={d.skills?.length}
            badge={<AiBadge />}
          >
            <SkillsEditor
              resume={d}
              setResume={(data) => touch({ ...resume, data })}
              onSuggest={suggestSkills}
              suggesting={suggesting}
              suggestions={suggestions}
              addSuggestion={addSuggestion}
            />
          </SectionCard>

          <SectionCard
            icon={FolderGit2}
            title="Projects"
            count={d.projects?.length}
            defaultOpen={false}
          >
            <ProjectsEditor
              resume={d}
              setResume={(data) => touch({ ...resume, data })}
            />
          </SectionCard>

          <SectionCard
            icon={BadgeCheck}
            title="Certifications"
            count={d.certifications?.length}
            defaultOpen={false}
          >
            <CertsEditor
              resume={d}
              setResume={(data) => touch({ ...resume, data })}
            />
          </SectionCard>

          <SectionCard
            icon={Languages}
            title="Languages"
            count={d.languages?.length}
            defaultOpen={false}
          >
            <LanguagesEditor
              resume={d}
              setResume={(data) => touch({ ...resume, data })}
            />
          </SectionCard>
        </div>

        {/* Preview column */}
        <div className={`${mobileTab === "preview" ? "" : "hidden lg:block"}`}>
          <div className="lg:sticky lg:top-32">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                <Eye size={15} /> Live preview — A4
              </h3>
              <Badge tone="slate">
                {TEMPLATES.find((t) => t.id === resume.template)?.name}
              </Badge>
            </div>
            <FitBox>
              <ResumePreview
                data={d}
                template={resume.template}
                accent={resume.accentColor}
              />
            </FitBox>
            <p className="mt-3 text-center text-[11px] text-slate-400">
              Prints exactly as shown — "Download PDF" opens your browser's
              print dialog (choose "Save as PDF").
            </p>
          </div>
        </div>
      </div>

      {/* Mobile tab switcher */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-slate-200 bg-white/95 p-2 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
        {[
          ["edit", PenLine, "Edit"],
          ["preview", Eye, "Preview"],
        ].map(([key, Icon, label]) => (
          <button
            key={key}
            onClick={() => setMobileTab(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold ${mobileTab === key ? "bg-brand-600 text-white" : "text-slate-500 dark:text-slate-400"}`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Tailor modal */}
      <Modal
        open={taillorOpen}
        onClose={() => setTaillorOpen(false)}
        title="Tailor resume to a job"
        wide
      >
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Paste the job description. AI rewrites your summary and bullet points
          to mirror its keywords — your real history stays intact.
        </p>
        <div className="space-y-4">
          <Field label="Job title (optional)">
            <Input
              value={jd.jobTitle}
              placeholder="e.g. Senior Frontend Engineer"
              onChange={(e) => setJd({ ...jd, jobTitle: e.target.value })}
            />
          </Field>
          <Field label="Job description">
            <Textarea
              rows={8}
              value={jd.jobDescription}
              placeholder="Paste the full job posting here…"
              onChange={(e) => setJd({ ...jd, jobDescription: e.target.value })}
            />
          </Field>
          <Button
            size="lg"
            variant="gradient"
            loading={tailoring}
            disabled={jd.jobDescription.trim().length < 50}
            onClick={tailor}
            className="w-full"
          >
            <Target size={17} /> Tailor my resume with AI
          </Button>
        </div>
        {tailorResult && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
            <p className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
              <Check size={16} /> Resume tailored & saved
            </p>
            {tailorResult.notes && (
              <p className="mt-1.5 text-xs leading-relaxed text-emerald-700/80 dark:text-emerald-300/80">
                {tailorResult.notes}
              </p>
            )}
            {(tailorResult.matchedKeywords || []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tailorResult.matchedKeywords.map((k) => (
                  <Badge key={k} tone="green">
                    {k}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
