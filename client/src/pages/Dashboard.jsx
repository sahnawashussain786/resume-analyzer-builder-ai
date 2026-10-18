import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  ScanLine,
  Mail,
  Plus,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { api, errMsg } from "../api/client.js";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ScoreRing,
  Modal,
} from "../components/ui.jsx";
import Navbar from "../components/Navbar.jsx";
import Spinner from "../components/Spinner.jsx";
import { emptyResume } from "../utils/resume.js";

function StatCard({ icon: Icon, label, value, sub, tone }) {
  const bg = {
    brand:
      "from-brand-500/15 to-brand-500/5 text-brand-600 dark:text-brand-400",
    green:
      "from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    amber:
      "from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400",
    fuchsia:
      "from-fuchsia-500/15 to-fuchsia-500/5 text-fuchsia-600 dark:text-fuchsia-400",
  }[tone];
  return (
    <Card className="flex items-center gap-4">
      <div className={`rounded-2xl bg-gradient-to-br p-3.5 ${bg}`}>
        <Icon size={22} strokeWidth={1.9} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
          {value}
        </p>
        {sub && <p className="truncate text-[11px] text-slate-400">{sub}</p>}
      </div>
    </Card>
  );
}

function TrendChart({ trend }) {
  if ((trend || []).filter((t) => t.score != null).length < 2)
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        Run 2+ analyses to see your score trend.
      </p>
    );
  const pts = trend.filter((t) => t.score != null);
  const W = 560,
    H = 160,
    P = 24;
  const xs = (i) => P + (i / (pts.length - 1)) * (W - 2 * P);
  const ys = (v) => H - P - (v / 100) * (H - 2 * P);
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xs(i)} ${ys(p.score)}`)
    .join(" ");
  const area = `${path} L ${xs(pts.length - 1)} ${H - P} L ${xs(0)} ${H - P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 50, 100].map((g) => (
        <g key={g}>
          <line
            x1={P}
            x2={W - P}
            y1={ys(g)}
            y2={ys(g)}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
            className="text-slate-400"
          />
          <text
            x={8}
            y={ys(g) + 4}
            fontSize="10"
            fill="currentColor"
            fillOpacity="0.4"
            className="text-slate-400"
          >
            {g}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#trendFill)" />
      <path
        d={path}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={xs(i)}
          cy={ys(p.score)}
          r="4"
          fill="#6366f1"
          stroke="white"
          strokeWidth="1.5"
        >
          <title>
            {p.label}: {p.score}
          </title>
        </circle>
      ))}
    </svg>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [newResumeModal, setNewResumeModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const load = () => {
    api
      .get("/dashboard/stats")
      .then(({ data }) => setStats(data))
      .catch((e) => setError(errMsg(e)));
  };
  useEffect(load, []);

  const createResume = async () => {
    setCreating(true);
    try {
      const { data } = await api.post("/resumes", {
        title: newTitle || "Untitled Resume",
        data: emptyResume(),
      });
      window.location.href = `/builder/${data._id}`;
    } catch (e) {
      setError(errMsg(e));
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Greeting */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
              Welcome back,{" "}
              <span className="text-gradient">{stats?.name || ""}</span>
              <span className="block text-lg font-semibold text-slate-500 dark:text-slate-400 sm:inline sm:pl-2">
                Your job-hunt command center
              </span>
            </h1>
          </div>
          <Button onClick={() => setNewResumeModal(true)}>
            <Plus size={17} /> New resume
          </Button>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </p>
        )}

        {!stats ? (
          <Spinner full label="Loading your dashboard…" />
        ) : (
          <>
            {/* Stats */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={FileText}
                label="Resumes"
                value={stats.counts.resumes}
                tone="brand"
                sub="in your workspace"
              />
              <StatCard
                icon={ScanLine}
                label="Analyses"
                value={stats.counts.analyses}
                tone="fuchsia"
              />
              <StatCard
                icon={Award}
                label="Avg ATS Score"
                value={stats.avgScore ?? "—"}
                tone="green"
                sub={
                  stats.bestScore != null
                    ? `Best: ${stats.bestScore}`
                    : undefined
                }
              />
              <StatCard
                icon={Mail}
                label="Cover Letters"
                value={stats.counts.coverLetters}
                tone="amber"
              />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {/* Trend */}
              <Card className="lg:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-800 dark:text-slate-100">
                    <TrendingUp size={17} className="text-brand-500" /> ATS
                    score trend
                  </h3>
                  <Badge
                    tone={
                      stats.avgScore >= 80
                        ? "green"
                        : stats.avgScore >= 60
                          ? "amber"
                          : "rose"
                    }
                  >
                    {stats.avgScore != null
                      ? `avg ${stats.avgScore}`
                      : "no data yet"}
                  </Badge>
                </div>
                <TrendChart trend={stats.trend} />
              </Card>

              {/* Quick actions */}
              <Card>
                <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-slate-800 dark:text-slate-100">
                  <Sparkles size={17} className="text-fuchsia-500" /> Quick
                  actions
                </h3>
                <div className="space-y-2.5">
                  {[
                    {
                      to: "/builder",
                      icon: FileText,
                      title: "Build a resume",
                      desc: "AI-assisted sections & live preview",
                    },
                    {
                      to: "/analyzer",
                      icon: ScanLine,
                      title: "Analyze a resume",
                      desc: "ATS score vs any job description",
                    },
                    {
                      to: "/coverletters",
                      icon: Mail,
                      title: "Generate cover letter",
                      desc: "Personalized, non-generic",
                    },
                    {
                      to: "/templates",
                      icon: BarChart3,
                      title: "Browse templates",
                      desc: "5 ATS-tested designs",
                    },
                  ].map((a) => (
                    <Link
                      key={a.to}
                      to={a.to}
                      className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-brand-300 hover:bg-brand-50/50 dark:border-slate-800 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/5"
                    >
                      <span className="rounded-xl bg-slate-100 p-2 text-slate-500 transition group-hover:bg-brand-100 group-hover:text-brand-600 dark:bg-slate-800">
                        <a.icon size={18} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">
                          {a.title}
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {a.desc}
                        </span>
                      </span>
                      <ArrowRight
                        size={15}
                        className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500"
                      />
                    </Link>
                  ))}
                </div>
              </Card>
            </div>

            {/* Recent */}
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <Card>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                    <FileText size={15} className="text-brand-500" /> Recent
                    resumes
                  </h3>
                  <Link
                    to="/builder"
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400"
                  >
                    View all
                  </Link>
                </div>
                {stats.recentResumes.length ? (
                  stats.recentResumes.map((r) => (
                    <Link
                      key={r._id}
                      to={`/builder/${r._id}`}
                      className="flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-brand-500" />
                        <span className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {r.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(r.updatedAt).toLocaleDateString()}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="py-4 text-sm text-slate-400">No resumes yet.</p>
                )}
              </Card>

              <Card>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                    <ScanLine size={15} className="text-fuchsia-500" /> Recent
                    analyses
                  </h3>
                  <Link
                    to="/analyzer/history"
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400"
                  >
                    View all
                  </Link>
                </div>
                {stats.recentAnalyses.length ? (
                  stats.recentAnalyses.map((a) => (
                    <Link
                      key={a._id}
                      to={`/analyzer/${a._id}`}
                      className="flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <div className="min-w-0 flex items-center gap-2.5">
                        <span
                          className={`h-2 w-2 rounded-full ${a.score >= 80 ? "bg-emerald-500" : a.score >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                        />
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {a.jobTitle || a.resumeName}
                          </span>
                          {a.jobCompany && (
                            <span className="block truncate text-[10px] text-slate-400">
                              {a.jobCompany}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {a.score}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="py-4 text-sm text-slate-400">
                    No analyses yet.
                  </p>
                )}
              </Card>

              <Card>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                    <Mail size={15} className="text-amber-500" /> Recent cover
                    letters
                  </h3>
                  <Link
                    to="/coverletters"
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400"
                  >
                    View all
                  </Link>
                </div>
                {stats.recentCoverLetters.length ? (
                  stats.recentCoverLetters.map((c) => (
                    <Link
                      key={c._id}
                      to="/coverletters"
                      className="flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {c.jobTitle || "Untitled"}
                        </span>
                        <span className="block truncate text-[10px] text-slate-400">
                          {c.company}
                        </span>
                      </div>
                      <Clock size={14} className="text-slate-300" />
                    </Link>
                  ))
                ) : (
                  <p className="py-4 text-sm text-slate-400">
                    No cover letters yet.
                  </p>
                )}
              </Card>
            </div>
          </>
        )}
      </main>

      <Modal
        open={newResumeModal}
        onClose={() => setNewResumeModal(false)}
        title="Create a new resume"
      >
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Give it a name — you can always change it later.
        </p>
        <input
          autoFocus
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="e.g. Google SWE Application"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setNewResumeModal(false)}>
            Cancel
          </Button>
          <Button loading={creating} onClick={createResume}>
            <Plus size={16} /> Create
          </Button>
        </div>
      </Modal>
    </div>
  );
}
