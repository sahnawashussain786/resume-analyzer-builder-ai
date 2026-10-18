import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutTemplate, ArrowRight, Check } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { Badge, Button, Card, Input, Field, Modal } from "../components/ui.jsx";
import ResumePreview from "../components/resume/ResumePreview.jsx";
import { sampleResume, TEMPLATES } from "../utils/resume.js";
import { api } from "../api/client.js";

export default function Templates() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null); // template id
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const start = async () => {
    setCreating(true);
    try {
      const { data } = await api.post("/resumes", {
        title: title || "Untitled Resume",
        template: open,
        data: sampleResume(),
      });
      navigate(`/builder/${data._id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            <LayoutTemplate size={24} className="mr-2 inline text-brand-500" />{" "}
            Resume templates
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Five ATS-tested designs. All included free, all print-perfect.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {TEMPLATES.map((t) => (
            <Card
              key={t.id}
              className="flex flex-col !p-4 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-800 dark:text-white">
                    {t.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">{t.description}</p>
                </div>
                <Badge tone="green">
                  <Check size={11} /> ATS-safe
                </Badge>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <div
                  style={{
                    transform: "scale(0.46)",
                    transformOrigin: "top left",
                    width: "217%",
                    height: 500,
                    overflow: "hidden",
                  }}
                >
                  <ResumePreview
                    data={sampleResume()}
                    template={t.id}
                    accent="#6366f1"
                  />
                </div>
              </div>
              <Button
                size="md"
                className="mt-4"
                onClick={() => {
                  setOpen(t.id);
                  setTitle(`${t.name} Resume`);
                }}
              >
                Use this template <ArrowRight size={15} />
              </Button>
            </Card>
          ))}
        </div>
      </main>

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title="Create resume from template"
      >
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          A sample-free blank resume will be created with the{" "}
          <strong className="text-slate-700 dark:text-slate-200">
            {TEMPLATES.find((t) => t.id === open)?.name}
          </strong>{" "}
          template. You can load sample data in the builder.
        </p>
        <Field label="Resume name">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Google SWE Application"
          />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(null)}>
            Cancel
          </Button>
          <Button loading={creating} onClick={start}>
            Create & open builder
          </Button>
        </div>
      </Modal>
    </div>
  );
}
