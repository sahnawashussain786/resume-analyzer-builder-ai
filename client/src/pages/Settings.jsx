import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as Cog,
  User,
  Lock,
  Moon,
  Sun,
  Trash2,
  Cpu,
  AlertTriangle,
} from "lucide-react";
import { api, errMsg } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import { Button, Card, Field, Input, Badge, Modal } from "../components/ui.jsx";

export default function Settings() {
  const { user, updateUser, logout, dark, setDark } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [msg, setMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [ai, setAi] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .get("/ai/status")
      .then(({ data }) => setAi(data))
      .catch(() => setAi(null));
  }, []);

  const flash = (ok, message) => {
    setMsg({ ok, message });
    setTimeout(() => setMsg(null), 4000);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const { data } = await api.put("/auth/profile", profile);
      updateUser({ name: data.user.name, email: data.user.email });
      flash(true, "Profile updated");
    } catch (e) {
      flash(false, errMsg(e));
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (pw.newPassword !== pw.confirm)
      return flash(false, "New passwords do not match");
    setSavingPw(true);
    try {
      await api.put("/auth/password", {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      flash(true, "Password updated");
    } catch (e) {
      flash(false, errMsg(e));
    } finally {
      setSavingPw(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete("/auth/account");
      logout();
      navigate("/");
    } catch (e) {
      flash(false, errMsg(e));
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            <Cog size={24} className="mr-2 inline text-slate-500" /> Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your account, security and preferences.
          </p>
        </div>

        {msg && (
          <p
            className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${msg.ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"}`}
          >
            {msg.message}
          </p>
        )}

        <div className="space-y-5">
          {/* Profile */}
          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
              <User size={16} className="text-brand-500" /> Profile
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <Input
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-end">
              <Button loading={savingProfile} onClick={saveProfile}>
                Save changes
              </Button>
            </div>
          </Card>

          {/* Appearance */}
          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
              {dark ? (
                <Moon size={16} className="text-brand-500" />
              ) : (
                <Sun size={16} className="text-amber-500" />
              )}{" "}
              Appearance
            </h2>
            <button
              onClick={() => setDark(!dark)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 dark:border-slate-700"
            >
              <span className="flex items-center gap-3">
                {dark ? (
                  <Moon size={18} className="text-brand-500" />
                ) : (
                  <Sun size={18} className="text-amber-500" />
                )}
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Dark mode
                </span>
              </span>
              <span
                className={`relative h-6 w-11 rounded-full transition ${dark ? "bg-brand-600" : "bg-slate-300"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${dark ? "left-[22px]" : "left-0.5"}`}
                />
              </span>
            </button>
          </Card>

          {/* AI status */}
          <Card>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
              <Cpu size={16} className="text-fuchsia-500" /> AI engine
            </h2>
            {ai ? (
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={ai.connected ? "green" : "amber"}>
                  {ai.connected ? "Connected" : "Mock mode"}
                </Badge>
                <span className="text-xs text-slate-400">
                  Model: <strong>{ai.model}</strong>
                </span>
                {ai.mock && (
                  <p className="w-full text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Running with built-in mock AI (no live AI key in
                    server/.env). The full experience works, but outputs are
                    simulated. Add a live key (for example GROQ_API_KEY or
                    OPENAI_API_KEY) and set{" "}
                    <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">
                      AI_MOCK=false
                    </code>{" "}
                    for live AI.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Couldn't reach AI status.
              </p>
            )}
          </Card>

          {/* Password */}
          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
              <Lock size={16} className="text-slate-500" /> Password
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Current">
                <Input
                  type="password"
                  value={pw.currentPassword}
                  onChange={(e) =>
                    setPw({ ...pw, currentPassword: e.target.value })
                  }
                />
              </Field>
              <Field label="New">
                <Input
                  type="password"
                  value={pw.newPassword}
                  onChange={(e) =>
                    setPw({ ...pw, newPassword: e.target.value })
                  }
                />
              </Field>
              <Field label="Confirm new">
                <Input
                  type="password"
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="secondary"
                loading={savingPw}
                disabled={!pw.currentPassword || !pw.newPassword}
                onClick={savePassword}
              >
                Update password
              </Button>
            </div>
          </Card>

          {/* Danger zone */}
          <Card className="!border-rose-200 dark:!border-rose-500/20">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-400">
              <AlertTriangle size={16} /> Danger zone
            </h2>
            <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
              Deleting your account permanently removes all resumes, analyses
              and cover letters.
            </p>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={15} /> Delete my account
            </Button>
          </Card>
        </div>
      </main>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete account?"
      >
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          This cannot be undone. All your data — resumes, analyses, cover
          letters — will be permanently deleted. Type{" "}
          <strong className="text-rose-600">DELETE</strong> to confirm.
        </p>
        <Input
          className="mt-3"
          value={deleteText}
          onChange={(e) => setDeleteText(e.target.value.toUpperCase())}
          placeholder="DELETE"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleting}
            disabled={deleteText !== "DELETE"}
            onClick={deleteAccount}
          >
            Delete forever
          </Button>
        </div>
      </Modal>
    </div>
  );
}
