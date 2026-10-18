import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  ListChecks,
  FolderGit2,
  BadgeCheck,
  Languages,
  Type,
} from "lucide-react";
import {
  Button,
  Input,
  Label,
  Select,
  Textarea,
  Badge,
  AiBadge,
} from "../ui.jsx";

const update = (resume, key, value) => ({ ...resume, [key]: value });

export function SectionCard({
  icon: Icon,
  title,
  children,
  defaultOpen = true,
  count,
  badge,
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span className="rounded-xl bg-brand-50 p-2 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <Icon size={17} />
        </span>
        <span className="flex-1 font-display text-sm font-bold text-slate-800 dark:text-slate-100">
          {title}
        </span>
        {badge}
        {count != null && <Badge tone="slate">{count}</Badge>}
        {open ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </button>
      {open && (
        <div className="border-t border-slate-100 p-5 dark:border-slate-800">
          {children}
        </div>
      )}
    </div>
  );
}

function ItemShell({ index, length, onUp, onDown, onRemove, title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title} {index + 1}
        </p>
        <div className="flex gap-0.5">
          <button
            onClick={onUp}
            disabled={index === 0}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-700"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={onDown}
            disabled={index === length - 1}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-700"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={onRemove}
            className="rounded-md p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

const move = (arr, i, dir) => {
  const next = [...arr];
  const j = i + dir;
  if (j < 0 || j >= next.length) return next;
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

/* ------------------------------- Basics ------------------------------- */

export function BasicsEditor({ resume, setResume }) {
  const b = resume.basics || {};
  const fields = [
    ["name", "Full name", "Alex Morgan"],
    ["jobTitle", "Target job title", "Software Engineer"],
    ["email", "Email", "you@example.com"],
    ["phone", "Phone", "+1 (555) 123-4567"],
    ["location", "Location", "San Francisco, CA"],
    ["website", "Website / portfolio", "yoursite.dev"],
    ["linkedin", "LinkedIn", "linkedin.com/in/you"],
    ["github", "GitHub", "github.com/you"],
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map(([k, label, ph], i) => (
        <div key={k} className={i < 2 ? "sm:col-span-2" : ""}>
          <Label>{label}</Label>
          <Input
            value={b[k] || ""}
            placeholder={ph}
            onChange={(e) =>
              setResume(update(resume, "basics", { ...b, [k]: e.target.value }))
            }
          />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- Summary ------------------------------ */

export function SummaryEditor({ resume, setResume, onGenerate, generating }) {
  const [tone, setTone] = useState("professional");
  return (
    <div>
      <Label>Professional summary</Label>
      <Textarea
        rows={4}
        value={resume.summary || ""}
        onChange={(e) => setResume(update(resume, "summary", e.target.value))}
        placeholder="2–4 sentences highlighting who you are, your experience and your strengths…"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="!w-auto"
        >
          <option value="professional">Professional tone</option>
          <option value="confident">Confident tone</option>
          <option value="friendly">Friendly tone</option>
          <option value="leadership">Leadership tone</option>
          <option value="concise">Concise</option>
        </Select>
        <Button
          size="sm"
          variant="gradient"
          loading={generating}
          onClick={() => onGenerate(tone)}
        >
          <Sparkles size={14} /> Generate with AI
        </Button>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        AI uses your target title, skills and experience to write this — then
        you can edit freely.
      </p>
    </div>
  );
}

/* ----------------------------- Experience ----------------------------- */

export function ExperienceEditor({
  resume,
  setResume,
  onEnhance,
  enhancingIdx,
}) {
  const items = resume.experience || [];
  const set = (next) => setResume(update(resume, "experience", next));
  const edit = (i, patch) =>
    set(items.map((x, ix) => (ix === i ? { ...x, ...patch } : x)));

  return (
    <div className="space-y-3">
      {items.map((e, i) => (
        <ItemShell
          key={i}
          index={i}
          length={items.length}
          title="Role"
          onUp={() => set(move(items, i, -1))}
          onDown={() => set(move(items, i, 1))}
          onRemove={() => set(items.filter((_, ix) => ix !== i))}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Job title</Label>
              <Input
                value={e.title || ""}
                placeholder="Senior Engineer"
                onChange={(ev) => edit(i, { title: ev.target.value })}
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={e.company || ""}
                placeholder="Acme Corp"
                onChange={(ev) => edit(i, { company: ev.target.value })}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={e.location || ""}
                placeholder="Remote / City"
                onChange={(ev) => edit(i, { location: ev.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Start</Label>
                <Input
                  type="month"
                  value={e.startDate || ""}
                  onChange={(ev) => edit(i, { startDate: ev.target.value })}
                />
              </div>
              <div>
                <Label>End</Label>
                <Input
                  type="month"
                  value={e.endDate || ""}
                  disabled={e.current}
                  onChange={(ev) => edit(i, { endDate: ev.target.value })}
                />
              </div>
            </div>
          </div>
          <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={!!e.current}
              onChange={(ev) => edit(i, { current: ev.target.checked })}
              className="h-3.5 w-3.5 rounded accent-brand-600"
            />{" "}
            I currently work here
          </label>
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between">
              <Label className="!mb-0">
                Achievement bullets (one per line)
              </Label>
              <Button
                size="sm"
                variant="gradient"
                loading={enhancingIdx === i}
                onClick={() => onEnhance(i)}
              >
                <Sparkles size={13} /> Improve with AI
              </Button>
            </div>
            <Textarea
              rows={4}
              value={(e.bullets || []).join("\n")}
              className="!leading-relaxed"
              onChange={(ev) =>
                edit(i, { bullets: ev.target.value.split("\n") })
              }
              placeholder={
                "Led migration of legacy monolith to microservices, cutting deploy time 68%\nImproved API latency by 45% via caching strategy"
              }
            />
          </div>
        </ItemShell>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() =>
          set([
            ...items,
            {
              title: "",
              company: "",
              location: "",
              startDate: "",
              endDate: "",
              current: false,
              bullets: [],
            },
          ])
        }
      >
        <Plus size={15} /> Add experience
      </Button>
    </div>
  );
}

/* ------------------------------ Education ----------------------------- */

export function EducationEditor({ resume, setResume }) {
  const items = resume.education || [];
  const set = (next) => setResume(update(resume, "education", next));
  const edit = (i, patch) =>
    set(items.map((x, ix) => (ix === i ? { ...x, ...patch } : x)));
  return (
    <div className="space-y-3">
      {items.map((e, i) => (
        <ItemShell
          key={i}
          index={i}
          length={items.length}
          title="Education"
          onUp={() => set(move(items, i, -1))}
          onDown={() => set(move(items, i, 1))}
          onRemove={() => set(items.filter((_, ix) => ix !== i))}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>School / University</Label>
              <Input
                value={e.school || ""}
                placeholder="UC Berkeley"
                onChange={(ev) => edit(i, { school: ev.target.value })}
              />
            </div>
            <div>
              <Label>Degree</Label>
              <Input
                value={e.degree || ""}
                placeholder="B.S. Computer Science"
                onChange={(ev) => edit(i, { degree: ev.target.value })}
              />
            </div>
            <div>
              <Label>Field of study</Label>
              <Input
                value={e.field || ""}
                placeholder="Computer Science"
                onChange={(ev) => edit(i, { field: ev.target.value })}
              />
            </div>
            <div>
              <Label>Grade / GPA</Label>
              <Input
                value={e.grade || ""}
                placeholder="3.8 GPA"
                onChange={(ev) => edit(i, { grade: ev.target.value })}
              />
            </div>
            <div>
              <Label>Start</Label>
              <Input
                type="month"
                value={e.startDate || ""}
                onChange={(ev) => edit(i, { startDate: ev.target.value })}
              />
            </div>
            <div>
              <Label>End</Label>
              <Input
                type="month"
                value={e.endDate || ""}
                onChange={(ev) => edit(i, { endDate: ev.target.value })}
              />
            </div>
          </div>
        </ItemShell>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() =>
          set([
            ...items,
            {
              school: "",
              degree: "",
              field: "",
              grade: "",
              startDate: "",
              endDate: "",
            },
          ])
        }
      >
        <Plus size={15} /> Add education
      </Button>
    </div>
  );
}

/* ------------------------------- Skills ------------------------------- */

export function SkillsEditor({
  resume,
  setResume,
  onSuggest,
  suggesting,
  suggestions,
  addSuggestion,
}) {
  const items = (resume.skills || []).map((s) =>
    typeof s === "string" ? { name: s } : s,
  );
  const [input, setInput] = useState("");
  const add = (name) => {
    if (
      !name.trim() ||
      items.some((s) => s.name.toLowerCase() === name.trim().toLowerCase())
    )
      return;
    setResume(
      update(resume, "skills", [
        ...items,
        { name: name.trim(), level: "Intermediate" },
      ]),
    );
  };
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {items.map((s, i) => (
          <span
            key={i}
            className="group inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
          >
            {s.name}
            <button
              onClick={() =>
                setResume(
                  update(
                    resume,
                    "skills",
                    items.filter((_, ix) => ix !== i),
                  ),
                )
              }
              className="text-brand-400 hover:text-rose-500"
            >
              ✕
            </button>
          </span>
        ))}
        {!items.length && (
          <p className="text-xs text-slate-400">
            No skills yet — add some or let AI suggest.
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          placeholder="Type a skill and press Enter…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(input);
              setInput("");
            }
          }}
        />
        <Button
          variant="secondary"
          size="md"
          onClick={() => {
            add(input);
            setInput("");
          }}
        >
          Add
        </Button>
      </div>
      <Button
        size="sm"
        variant="gradient"
        loading={suggesting}
        className="mt-3"
        onClick={onSuggest}
      >
        <Sparkles size={14} /> Suggest skills with AI
      </Button>
      {(suggestions || []).length > 0 && (
        <div className="mt-3 rounded-xl border border-fuchsia-200 bg-fuchsia-50/50 p-3 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/5">
          <AiBadge label="AI suggestions" />
          <div className="mt-2 space-y-1.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => addSuggestion(s)}
                className="flex w-full items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-left text-xs shadow-sm hover:ring-2 hover:ring-fuchsia-300 dark:bg-slate-800"
              >
                <span>
                  <strong className="text-slate-800 dark:text-slate-100">
                    {s.name}
                  </strong>
                  <span className="ml-2 text-slate-400">{s.reason}</span>
                </span>
                <Plus size={14} className="shrink-0 text-fuchsia-500" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Projects ------------------------------ */

export function ProjectsEditor({ resume, setResume }) {
  const items = resume.projects || [];
  const set = (next) => setResume(update(resume, "projects", next));
  const edit = (i, patch) =>
    set(items.map((x, ix) => (ix === i ? { ...x, ...patch } : x)));
  return (
    <div className="space-y-3">
      {items.map((p, i) => (
        <ItemShell
          key={i}
          index={i}
          length={items.length}
          title="Project"
          onUp={() => set(move(items, i, -1))}
          onDown={() => set(move(items, i, 1))}
          onRemove={() => set(items.filter((_, ix) => ix !== i))}
        >
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input
                  value={p.name || ""}
                  placeholder="OpenMetrics"
                  onChange={(ev) => edit(i, { name: ev.target.value })}
                />
              </div>
              <div>
                <Label>Link</Label>
                <Input
                  value={p.link || ""}
                  placeholder="github.com/you/project"
                  onChange={(ev) => edit(i, { link: ev.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Tech stack</Label>
              <Input
                value={p.tech || ""}
                placeholder="React, Node.js, PostgreSQL"
                onChange={(ev) => edit(i, { tech: ev.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={p.description || ""}
                placeholder="What it does and the impact…"
                onChange={(ev) => edit(i, { description: ev.target.value })}
              />
            </div>
          </div>
        </ItemShell>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() =>
          set([...items, { name: "", link: "", tech: "", description: "" }])
        }
      >
        <Plus size={15} /> Add project
      </Button>
    </div>
  );
}

/* --------------------------- Certifications --------------------------- */

export function CertsEditor({ resume, setResume }) {
  const items = resume.certifications || [];
  const set = (next) => setResume(update(resume, "certifications", next));
  const edit = (i, patch) =>
    set(items.map((x, ix) => (ix === i ? { ...x, ...patch } : x)));
  return (
    <div className="space-y-3">
      {items.map((c, i) => (
        <ItemShell
          key={i}
          index={i}
          length={items.length}
          title="Certification"
          onUp={() => set(move(items, i, -1))}
          onDown={() => set(move(items, i, 1))}
          onRemove={() => set(items.filter((_, ix) => ix !== i))}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input
                value={c.name || ""}
                placeholder="AWS Solutions Architect"
                onChange={(ev) => edit(i, { name: ev.target.value })}
              />
            </div>
            <div>
              <Label>Issuer</Label>
              <Input
                value={c.issuer || ""}
                placeholder="Amazon"
                onChange={(ev) => edit(i, { issuer: ev.target.value })}
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="month"
                value={c.date || ""}
                onChange={(ev) => edit(i, { date: ev.target.value })}
              />
            </div>
          </div>
        </ItemShell>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => set([...items, { name: "", issuer: "", date: "" }])}
      >
        <Plus size={15} /> Add certification
      </Button>
    </div>
  );
}

/* ------------------------------ Languages ----------------------------- */

export function LanguagesEditor({ resume, setResume }) {
  const items = resume.languages || [];
  const set = (next) => setResume(update(resume, "languages", next));
  const edit = (i, patch) =>
    set(items.map((x, ix) => (ix === i ? { ...x, ...patch } : x)));
  return (
    <div className="space-y-3">
      {items.map((l, i) => (
        <ItemShell
          key={i}
          index={i}
          length={items.length}
          title="Language"
          onUp={() => set(move(items, i, -1))}
          onDown={() => set(move(items, i, 1))}
          onRemove={() => set(items.filter((_, ix) => ix !== i))}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Language</Label>
              <Input
                value={l.name || ""}
                placeholder="English"
                onChange={(ev) => edit(i, { name: ev.target.value })}
              />
            </div>
            <div>
              <Label>Level</Label>
              <Select
                value={l.level || "Intermediate"}
                onChange={(ev) => edit(i, { level: ev.target.value })}
              >
                {[
                  "Native",
                  "Fluent",
                  "Advanced",
                  "Intermediate",
                  "Conversational",
                  "Basic",
                ].map((lv) => (
                  <option key={lv}>{lv}</option>
                ))}
              </Select>
            </div>
          </div>
        </ItemShell>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => set([...items, { name: "", level: "Native" }])}
      >
        <Plus size={15} /> Add language
      </Button>
    </div>
  );
}
