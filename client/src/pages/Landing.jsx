import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ScanLine, FileText, Mail, Target, Zap, ShieldCheck, TrendingUp,
  Wand2, Download, CheckCircle2, ArrowRight, ChevronDown, Star, BrainCircuit, 
  ListChecks, Gauge, Languages, Award, Briefcase,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ThemeToggle } from '../components/Navbar.jsx';
import Logo from '../components/Logo.jsx';
import Footer from '../components/Footer.jsx';
import { Button, Badge } from '../components/ui.jsx';

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: 'easeOut' },
  }),
};

function Section({ id, children, className = '' }) {
  return (
    <section id={id} className={`mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 ${className}`}>{children}</section>
  );
}

function FeatureCard({ icon: Icon, title, children, i }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={i % 3}
      className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/30">
      <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-brand-500/10 to-fuchsia-500/10 p-3.5 text-brand-600 transition group-hover:from-brand-500 group-hover:to-fuchsia-600 group-hover:text-white dark:text-brand-400">
        <Icon size={26} strokeWidth={1.8} />
      </div>
      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{children}</p>
    </motion.div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
        <span className="font-semibold text-slate-800 dark:text-slate-100">{q}</span>
        <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="px-6 pb-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{a}</p>}
    </div>
  );
}

export default function Landing() {
  const { user, dark } = useAuth();
  const walker = user ? '/dashboard' : '/login';

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {/* ------------------------------- NAV ------------------------------- */}
        <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Logo />
            <div className="hidden items-center gap-7 text-sm font-semibold text-slate-600 dark:text-slate-300 md:flex">
              <a href="#features" className="hover:text-brand-600 dark:hover:text-white">Features</a>
              <a href="#how" className="hover:text-brand-600 dark:hover:text-white">How it works</a>
              <a href="#pricing" className="hover:text-brand-600 dark:hover:text-white">Pricing</a>
              <a href="#faq" className="hover:text-brand-600 dark:hover:text-white">FAQ</a>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <Link to="/dashboard"><Button size="md">Dashboard</Button></Link>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:block"><Button variant="ghost">Log in</Button></Link>
                  <Link to="/register"><Button size="md">Get started free</Button></Link>
                </>
              )}
            </div>
          </nav>
        </header>

        {/* ------------------------------- HERO ------------------------------ */}
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500/25 via-fuchsia-500/20 to-orange-400/20 blur-3xl dark:opacity-60" />
          <div className="pointer-events-none absolute -left-32 top-64 h-96 w-96 rounded-full bg-brand-400/15 blur-3xl animate-blob" />
          <div className="pointer-events-none absolute -right-32 top-32 h-96 w-96 rounded-full bg-fuchsia-400/15 blur-3xl animate-blob" style={{ animationDelay: '-8s' }} />

          <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              <div>
                <motion.div variants={fadeUp} initial="hidden" animate="show">
                  <Badge className="text-sm !px-3.5 !py-1.5">
                    <Sparkles size={14} /> AI Resume Builder + ATS Analyzer
                  </Badge>
                </motion.div>
                <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1}
                  className="mt-5 font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                  Forge a resume that <span className="text-gradient">beats the ATS</span> and lands interviews
                </motion.h1>
                <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2}
                  className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
                  Build a stunning resume in minutes with AI that writes, improves and quantifies your
                  experience. Then analyze it against any job description with a real ATS score — before
                  recruiters ever see it.
                </motion.p>
                <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to={walker}><Button size="lg" className="w-full sm:w-auto">
                    <Wand2 size={18} /> Build my resume free
                  </Button></Link>
                  <Link to={walker}><Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <ScanLine size={18} /> Analyze my resume
                  </Button></Link>
                </motion.div>
                <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}
                  className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                  {['No credit card required', '5 professional templates', 'Instant ATS score'].map((t) => (
                    <span key={t} className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-500" /> {t}</span>
                  ))}
                </motion.div>
              </div>

              {/* Hero visual: mini score card + resume card */}
              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div className="animate-float rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">ats analysis</span>
                  </div>
                  <div className="py-5">
                    <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 p-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ATS Score</p>
                        <p className="font-display text-4xl font-extrabold text-emerald-500">92<span className="text-lg text-slate-400">/100</span></p>
                      </div>
                      <div className="flex flex-col gap-1.5 text-right text-[11px] font-semibold">
                        <span className="text-emerald-600 dark:text-emerald-400">✓ Keywords matched</span>
                        <span className="text-emerald-600 dark:text-emerald-400">✓ Quantified impact</span>
                        <span className="text-amber-600 dark:text-amber-400">▲ Add 2 skills</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {[
                        ['Keyword Match', 95, '#10b981'],
                        ['Impact & Achievements', 88, '#10b981'],
                        ['Skills Coverage', 76, '#f59e0b'],
                        ['Formatting', 90, '#10b981'],
                      ].map(([label, val, color]) => (
                        <div key={label}>
                          <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            <span>{label}</span><span style={{ color }}>{val}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div className="h-full rounded-full" style={{ width: `${val}%`, background: color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-2xl bg-brand-50 p-3.5 text-[11.5px] leading-relaxed text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                      <strong className="flex items-center gap-1.5 font-bold"><BrainCircuit size={13} /> AI suggestion</strong>
                      <span className="mt-1 block opacity-80">"Quantify your leadership bullet: 'Mentored 6 engineers, raising team velocity 30%.'"</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-3 hidden rotate-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-800 sm:block">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Interviews landed</p>
                  <p className="font-display text-xl font-bold text-emerald-500">+312%</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ----------------------------- FEATURES ---------------------------- */}
        <Section id="features">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto mb-14 max-w-2xl text-center">
            <Badge><Briefcase size={12} /> Everything you need</Badge>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">One workspace for your entire job hunt</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400">From a blank page to a fully tailored application — built, scored and optimized by AI.</p>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={Wand2} title="AI Resume Builder" i={0}>
              Sections, summaries and bullet points written for you. Pick from 5 polished templates and export a polished PDF instantly.
            </FeatureCard>
            <FeatureCard icon={ScanLine} title="ATS Score Analyzer" i={1}>
              Upload or paste your resume, add any job description and get an honest ATS score with category breakdowns.
            </FeatureCard>
            <FeatureCard icon={Target} title="Keyword Optimization" i={2}>
              The analyzer finds missing keywords from the job description so your resume passes the exact filters recruiters use.
            </FeatureCard>
            <FeatureCard icon={FileText} title="Job Description Tailoring" i={3}>
              One click rewrites your summary and bullets to mirror any job posting — without changing your true history.
            </FeatureCard>
            <FeatureCard icon={Mail} title="AI Cover Letters" i={4}>
              Generate a personalized, non-generic cover letter from your resume and the job description in your chosen tone.
            </FeatureCard>
            <FeatureCard icon={Download} title="One-click PDF Export" i={5}>
              Print-optimized templates that render to crisp, selectable-text PDFs from any device.
            </FeatureCard>
          </div>
        </Section>

        {/* ---------------------------- HOW IT WORKS -------------------------- */}
        <div className="bg-slate-50 dark:bg-slate-900/50">
          <Section id="how">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto mb-14 max-w-2xl text-center">
              <Badge><Zap size={12} /> 10 minutes, start to finish</Badge>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">From zero to interview-ready</h2>
            </motion.div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: FileText, step: '01', title: 'Build or import', text: 'Start from scratch with AI-assisted sections, or paste an existing resume to improve it.' },
                { icon: Gauge, step: '02', title: 'Analyze & score', text: 'Run the ATS analyzer against your target job description and get a fix-it list with priorities.' },
                { icon: TrendingUp, step: '03', title: 'Tailor & export', text: 'Apply one-click tailoring, download the final PDF, and optionally generate a matching cover letter.' },
              ].map((s, i) => (
                <motion.div key={s.step} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
                  className="relative rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                  <span className="font-display absolute right-6 top-5 text-5xl font-extrabold text-slate-100 dark:text-slate-800">{s.step}</span>
                  <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-brand-600 to-fuchsia-600 p-3 text-white shadow-lg shadow-brand-600/25">
                    <s.icon size={22} />
                  </div>
                  <h3 className="font-display text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.text}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>

        {/* ---------------------------- TESTIMONIALS -------------------------- */}
        <Section>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto mb-14 max-w-2xl text-center">
            <Badge><Star size={12} fill="currentColor" /> Loved by job seekers</Badge>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">They stopped guessing. They got hired.</h2>
          </motion.div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { name: 'Priya Sharma', role: 'Product Manager → hired at Fintech', text: 'The ATS analyzer told me exactly which keywords my resume was missing. After fixing them, my response rate tripled in two weeks.' },
              { name: 'Marcus Chen', role: 'SWE → hired at unicorn startup', text: 'I used the tailor feature before every application. Each resume felt hand-crafted for the role — because it was.' },
              { name: 'Sofia Reyes', role: 'Marketing Lead → career changer', text: 'Switching careers felt impossible until the AI rewrote my summary to connect my past experience to my new field.' },
            ].map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
                className="rounded-3xl border border-slate-200 bg-white p-7 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex gap-1 text-amber-400">
                  {Array(5).fill(0).map((_, s) => <Star key={s} size={15} fill="currentColor" />)}
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 font-bold text-white">{t.name[0]}</span>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ------------------------------ PRICING ---------------------------- */}
        <div className="bg-slate-50 dark:bg-slate-900/50">
          <Section id="pricing">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto mb-14 max-w-2xl text-center">
              <Badge><ShieldCheck size={12} /> Simple pricing</Badge>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Start free. Upgrade when you're hunting seriously.</h2>
            </motion.div>
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
              <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-display text-xl font-bold">Free</h3>
                <p className="mt-3 font-display text-4xl font-extrabold">$0<span className="text-base font-semibold text-slate-400">/forever</span></p>
                <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {['Unlimited resume building', 'All 5 templates', '3 AI analyses per month', 'ATS score & suggestions', 'PDF export'].map((f) => (
                    <li key={f} className="flex gap-2.5"><CheckCircle2 size={17} className="shrink-0 text-emerald-500" /> {f}</li>
                  ))}
                </ul>
                <Link to={walker} className="mt-8 block"><Button variant="outline" size="lg" className="w-full">Get started free</Button></Link>
              </motion.div>
              <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="relative rounded-3xl border-2 border-brand-500 bg-white p-8 shadow-xl shadow-brand-600/10 dark:bg-slate-900">
                <Badge className="absolute -top-3 left-8">Most popular</Badge>
                <h3 className="font-display text-xl font-bold">Pro</h3>
                <p className="mt-3 font-display text-4xl font-extrabold">$9<span className="text-base font-semibold text-slate-400">/month</span></p>
                <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {['Everything in Free', 'Unlimited AI analyses', 'Unlimited one-click tailoring', 'Unlimited AI cover letters', 'Priority AI queue'].map((f) => (
                    <li key={f} className="flex gap-2.5"><CheckCircle2 size={17} className="shrink-0 text-brand-500" /> {f}</li>
                  ))}
                </ul>
                <Link to={walker} className="mt-8 block"><Button size="lg" className="w-full">Try Pro features</Button></Link>
              </motion.div>
            </div>
          </Section>
        </div>

        {/* -------------------------------- FAQ ------------------------------ */}
        <Section id="faq" className="mx-auto max-w-3xl">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12 text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Frequently asked questions</h2>
          </motion.div>
          <div className="space-y-3">
            {[
              ['What is an ATS, and why does scoring matter?', 'An Applicant Tracking System is the software that screens resumes before a human does — roughly 75% of resumes are filtered out. Our analyzer simulates that screening: it scores keyword match, formatting, impact metrics and skills coverage so you can fix issues before applying.'],
              ['Does the AI fabricate experience?', 'No. The AI rewrites and strengthens what you provide — it never invents employers, dates or roles. It can suggest where to add metrics, which you confirm.'],
              ['Can I import my existing resume?', 'Yes — paste the text of an existing resume or upload a PDF/DOCX to the analyzer. The AI finds missing keywords and suggests an improved summary you can drop into the builder.'],
              ['Is my data private?', 'Your account and resumes are yours alone. We never sell data and never use your resume content to train models.'],
              ['Which templates are included?', 'Modern, Classic, Minimal, Elegant and Compact — all ATS-tested, all included on the free plan.'],
            ].map(([q, a]) => <FaqItem key={q} q={q} a={a} />)}
          </div>
        </Section>

        {/* ------------------------------ FINAL CTA --------------------------- */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-fuchsia-700">
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
          <Section className="text-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <h2 className="font-display mx-auto max-w-2xl text-3xl font-extrabold text-white sm:text-5xl">Your next resume could be the one that gets you hired.</h2>
              <p className="mx-auto mt-4 max-w-xl text-brand-100">
                Free forever on the core plan. Your AI-built, ATS-optimized resume is minutes away.
              </p>
              <Link to={walker} className="mt-8 inline-block">
                <Button size="lg" className="bg-white text-brand-700 shadow-2xl hover:bg-brand-50">
                  <ArrowRight size={18} /> Build my resume free
                </Button>
              </Link>
            </motion.div>
          </Section>
        </div>

        <Footer />
      </div>
    </div>
  );
}

