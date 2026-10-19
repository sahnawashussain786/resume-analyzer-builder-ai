import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Button, Input, Field } from "../components/ui.jsx";
import { errMsg } from "../api/client.js";
import Logo from "../components/Logo.jsx";

const strengths = [
  "At least 8 characters",
  "One uppercase letter",
  "One number",
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export default function Register() {
  const { register, dark, setDark } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const pwOk = (p) => ({
    length: p.length >= 8,
    upper: /[A-Z]/.test(p),
    number: /\d/.test(p),
  });
  const checks = pwOk(form.password);
  const allOk = Object.values(checks).every(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!allOk) {
      setError("Password does not meet all requirements");
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="grid min-h-screen bg-slate-50 dark:bg-slate-950 lg:grid-cols-2">
        {/* Left panel */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-fuchsia-700 via-brand-600 to-brand-700 p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -left-20 top-1/3 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-blob" />
          <Logo />
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-4xl font-extrabold leading-tight text-white"
            >
              Create your account.
              <br />
              Forge your future.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-5 max-w-md text-white/80"
            >
              Free forever for the essentials: unlimited building, all
              templates, AI analyses, PDF export.
            </motion.p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center text-white">
              {[
                ["90+", "ATS checks"],
                ["5", "Templates"],
                ["∞", "Resumes"],
              ].map(([num, label]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-white/10 p-4 backdrop-blur"
                >
                  <p className="font-display text-2xl font-extrabold">{num}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-white/70">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/60">No credit card required.</p>
        </div>

        {/* Form */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <motion.div
            className="w-full max-w-md"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Logo />
              <button
                onClick={() => setDark(!dark)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                {dark ? "☀" : "☾"}
              </button>
            </div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl"
            >
              Create your free account
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-2 text-sm text-slate-500 dark:text-slate-400"
            >
              Already have one?{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                Log in
              </Link>
            </motion.p>

            <motion.form
              variants={fadeUp}
              onSubmit={submit}
              className="mt-8 space-y-4"
            >
              <Field label="Full name">
                <Input
                  required
                  placeholder="Alex Morgan"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Password">
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    aria-label="Toggle password"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {strengths.map((s, i) => {
                    const ok = [checks.length, checks.upper, checks.number][i];
                    return (
                      <span
                        key={s}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ok ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}
                      >
                        {ok ? "✓ " : ""}
                        {s}
                      </span>
                    );
                  })}
                </div>
              </Field>
              <Field label="Confirm password">
                <Input
                  type={showPw ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={(e) =>
                    setForm({ ...form, confirm: e.target.value })
                  }
                />
              </Field>
              {error && (
                <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="w-full"
              >
                <UserPlus size={17} /> Create account
              </Button>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
