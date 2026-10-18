import { useEffect, useState } from "react";
import {
  Plus,
  Mail,
  Trash2,
  Copy,
  Check,
  Save,
  Wand2,
  FileText,
} from "lucide-react";
import { api, errMsg } from "../api/client.js";
import Navbar from "../components/Navbar.jsx";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
  AiBadge,
  Badge,
} from "../components/ui.jsx";
import Spinner from "../components/Spinner.jsx";

export default function CoverLetters() {
  const [letters, setLetters] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [genOpen, setGenOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [current, setCurrent] = useState(null); // selected letter for editing
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    resumeId: "",
    jobTitle: "",
    company: "",
    tone: "professional",
    jobDescription: "",
  });

  const load = () => {
    Promise.all([api.get("/coverletters"), api.get("/resumes")])
      .then(([cl, rs]) => {
        setLetters(cl.data);
        setResumes(rs.data);
        if (rs.data[0] && !form.resumeId)
          setForm((f) => ({ ...f, resumeId: rs.data[0]._id }));
      })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const generate = async () => {
    setGenerating(true);
    setError("");
    try {
      const resume = resumes.find((r) => r._id === form.resumeId);
      const { data } = await api.post("/coverletters/generate", {
        ...form,
        resumeData: resume?.data,
      });
      setLetters((ls) => [data.coverLetter, ...ls]);
      openLetter(data.coverLetter);
      setGenOpen(false);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setGenerating(false);
    }
  };

  const openLetter = async (l) => {
    const { data } = await api.get(`/coverletters/${l._id}`);
    setCurrent(data);
    setDraft(data.content);
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/coverletters/${current._id}`, {
        content: draft,
      });
      setCurrent(data);
      setLetters((ls) => ls.map((l) => (l._id === data._id ? data : l)));
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this cover letter?")) return;
    await api.delete(`/coverletters/${id}`);
    setLetters((ls) => ls.filter((l) => l._id !== id));
    if (current?._id === id) setCurrent(null);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const dirty = current && draft !== current.content;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
              <Mail size={24} className="mr-2 inline text-amber-500" /> AI Cover
              Letters
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Personalized, non-generic letters generated from your resume + the
              job description.
            </p>
          </div>
          <Button onClick={() => setGenOpen(true)}>
            <Plus size={16} /> Generate cover letter
          </Button>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </p>
        )}

        {loading ? (
          <Spinner full />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            {/* List */}
            <div className="space-y-3">
              {letters.length ? (
                letters.map((l) => (
                  <Card
                    key={l._id}
                    className={`cursor-pointer transition hover:border-brand-300 ${current?._id === l._id ? "!border-brand-400 ring-2 ring-brand-500/20" : ""}`}
                    onClick={() => openLetter(l)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-800 dark:text-slate-100">
                          {l.jobTitle || "Untitled letter"}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {l.company || "—"}
                        </p>
                        <Badge tone="slate" className="mt-2">
                          {l.tone}
                        </Badge>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(l._id);
                        }}
                        className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Card>
                ))
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No cover letters yet"
                  description="Generate your first AI cover letter — it takes ~15 seconds."
                  action={
                    <Button onClick={() => setGenOpen(true)}>
                      <Wand2 size={15} /> Generate
                    </Button>
                  }
                />
              )}
            </div>

            {/* Editor */}
            {current ? (
              <Card>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <AiBadge label="AI generated" />
                    <h2 className="ml-2 inline font-display text-lg font-bold text-slate-900 dark:text-white">
                      {current.jobTitle}
                      {current.company ? ` — ${current.company}` : ""}
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={copy}>
                      {copied ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}{" "}
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      loading={saving}
                      disabled={!dirty}
                      onClick={save}
                    >
                      <Save size={14} /> {dirty ? "Save" : "Saved"}
                    </Button>
                  </div>
                </div>
                <Textarea
                  rows={22}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="!text-[13.5px] !leading-relaxed"
                />
              </Card>
            ) : (
              !letters.length && <div className="hidden lg:block" />
            )}
          </div>
        )}
      </main>

      {/* Generate modal */}
      <Modal
        open={genOpen}
        onClose={() => setGenOpen(false)}
        title="Generate a cover letter"
        wide
      >
        <div className="space-y-4">
          <Field label="Which resume?">
            <Select
              value={form.resumeId}
              onChange={(e) => setForm({ ...form, resumeId: e.target.value })}
            >
              {resumes.length ? (
                resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title}
                  </option>
                ))
              ) : (
                <option value="">No resumes — build one first</option>
              )}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Job title">
              <Input
                value={form.jobTitle}
                placeholder="e.g. Frontend Engineer"
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              />
            </Field>
            <Field label="Company">
              <Input
                value={form.company}
                placeholder="e.g. Stripe"
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Tone">
            <Select
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
            >
              {[
                "professional",
                "enthusiastic",
                "concise",
                "creative",
                "formal",
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Job description">
            <Textarea
              rows={6}
              value={form.jobDescription}
              placeholder="Paste the job posting for a truly personalized letter…"
              onChange={(e) =>
                setForm({ ...form, jobDescription: e.target.value })
              }
            />
          </Field>
          <Button
            size="lg"
            variant="gradient"
            loading={generating}
            disabled={!form.resumeId || generating}
            onClick={generate}
            className="w-full"
          >
            <Wand2 size={17} /> Write my cover letter
          </Button>
        </div>
      </Modal>
    </div>
  );
}
