import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, LogIn, ScanLine, Wand2, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Button, Input, Field } from "../components/ui.jsx";
import { errMsg } from "../api/client.js";
import Logo from "../components/Logo.jsx";

export default function Login() {
  const { login, dark, setDark } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from || "/dashboard");
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
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-fuchsia-700 p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-blob" />
          <div
            className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-fuchsia-300/20 blur-3xl animate-blob"
            style={{ animationDelay: "-9s" }}
          />
          <Logo />
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-tight text-white">
              Welcome back.
              <br />
              Your next job is waiting.
            </h2>
            <p className="mt-5 max-w-md text-brand-100/90">
              Log in to your AI-built resumes, ATS analyses, tailored versions
              and cover letters.
            </p>
            <div className="mt-8 space-y-3 text-sm text-white/90">
              {[
                { icon: Wand2, t: "AI-written summaries & bullet points" },
                {
                  icon: ScanLine,
                  t: "Instant ATS score vs any job description",
                },
                { icon: Mail, t: "Matching AI cover letters" },
              ].map((f) => (
                <p key={f.t} className="flex items-center gap-3">
                  <span className="rounded-lg bg-white/15 p-2">
                    <f.icon size={16} />
                  </span>{" "}
                  {f.t}
                </p>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} ResumeForge — build, analyze, get
            hired.
          </p>
        </div>

        {/* Form */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Logo />
              <button
                onClick={() => setDark(!dark)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                {dark ? "☀" : "☾"}
              </button>
            </div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
              Log in to ResumeForge
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              New here?{" "}
              <Link
                to="/register"
                className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                Create a free account
              </Link>
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
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
                <LogIn size={17} /> Log in
              </Button>
            </form>
            <p className="mt-6 text-center text-xs text-slate-400">
              By continuing you agree to our fair, human-first use of AI in your
              job search.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
