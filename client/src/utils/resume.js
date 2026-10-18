export const emptyResume = () => ({
  basics: {
    name: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
});

export const sampleResume = () => ({
  basics: {
    name: "Alex Morgan",
    jobTitle: "Senior Software Engineer",
    email: "alex.morgan@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "alexmorgan.dev",
    linkedin: "linkedin.com/in/alexmorgan",
    github: "github.com/alexmorgan",
  },
  summary:
    "Senior software engineer with 7+ years of experience building scalable web applications and leading cross-functional teams. Specialized in React, Node.js and cloud infrastructure, with a proven record of shipping products that serve millions of users.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "TechScale Inc.",
      location: "San Francisco, CA",
      startDate: "2021-06",
      endDate: "",
      current: true,
      bullets: [
        "Led migration of legacy monolith to microservices, reducing deployment time by 68%",
        "Architected real-time analytics pipeline processing 2M+ events/day",
        "Mentored 6 engineers and established code review standards adopted company-wide",
      ],
    },
    {
      title: "Software Engineer",
      company: "StartupLab",
      location: "Remote",
      startDate: "2018-03",
      endDate: "2021-05",
      current: false,
      bullets: [
        "Built customer dashboard used by 40,000+ MAU, raising retention by 22%",
        "Reduced API latency by 45% through caching strategy and query optimization",
        "Shipped OAuth-based authentication serving 3 external integrations",
      ],
    },
  ],
  education: [
    {
      school: "University of California, Berkeley",
      degree: "B.S.",
      field: "Computer Science",
      startDate: "2014",
      endDate: "2018",
      grade: "3.8 GPA",
      description: "",
    },
  ],
  skills: [
    { name: "JavaScript", level: "Expert" },
    { name: "React", level: "Expert" },
    { name: "Node.js", level: "Advanced" },
    { name: "TypeScript", level: "Advanced" },
    { name: "AWS", level: "Advanced" },
    { name: "PostgreSQL", level: "Intermediate" },
    { name: "Docker", level: "Advanced" },
    { name: "CI/CD", level: "Advanced" },
  ],
  projects: [
    {
      name: "OpenMetrics",
      link: "github.com/alexmorgan/openmetrics",
      tech: "React, Node.js, InfluxDB",
      description:
        "Open-source monitoring dashboard with 3.2k GitHub stars, featured in JavaScript Weekly.",
    },
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023-04",
    },
  ],
  languages: [
    { name: "English", level: "Native" },
    { name: "Spanish", level: "Conversational" },
  ],
});

export const TEMPLATES = [
  {
    id: "modern",
    name: "Modern",
    description: "Bold header band with accent color",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Timeless serif, centered header",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean, ATS-friendly single column",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Accent rail with two-column body",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Space-efficient for one page",
  },
];

export const ACCENT_COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Orange", value: "#f97316" },
  { name: "Slate", value: "#334155" },
];

/**
 * Coerces untrusted/partial resume data (e.g. stored docs, AI output) into a
 * shape the preview templates can render without crashing.
 */
export function normalizeResume(input) {
  const src = input || {};
  const str = (v) => (typeof v === "string" ? v : "");
  const strObj = (v) => {
    if (!v || typeof v !== "object") return { name: "", level: "Intermediate" };
    return { ...v, name: str(v.name), level: v.level == null ? "" : str(v.level) };
  };
  const cleanArr = (arr, fn) =>
    (Array.isArray(arr) ? arr : []).filter((x) => x && typeof x === "object" && (fn ? fn(x) : true)).map(fn || ((x) => x));

  return {
    ...src,
    basics: {
      name: str(src.basics?.name),
      jobTitle: str(src.basics?.jobTitle),
      email: str(src.basics?.email),
      phone: str(src.basics?.phone),
      location: str(src.basics?.location),
      website: str(src.basics?.website),
      linkedin: str(src.basics?.linkedin),
      github: str(src.basics?.github),
    },
    summary: str(src.summary),
    experience: cleanArr(src.experience, (e) => ({
      title: str(e.title),
      company: str(e.company),
      location: str(e.location),
      startDate: str(e.startDate),
      endDate: str(e.endDate),
      current: !!e.current,
      bullets: Array.isArray(e.bullets) ? e.bullets.filter((b) => typeof b === "string" && b.trim()) : [],
    })).filter((e) => e.title || e.company || e.bullets.length),
    education: cleanArr(src.education, (e) => ({
      school: str(e.school), degree: str(e.degree), field: str(e.field),
      grade: str(e.grade), startDate: str(e.startDate), endDate: str(e.endDate), description: str(e.description),
    })).filter((e) => e.school || e.degree),
    skills: (Array.isArray(src.skills) ? src.skills : [])
      .map((s) => (typeof s === "string" ? { name: s } : s && typeof s === "object" ? strObj(s) : null))
      .filter((s) => s && s.name),
    projects: cleanArr(src.projects, (p) => ({
      name: str(p.name), link: str(p.link), tech: str(p.tech), description: str(p.description),
    })).filter((p) => p.name || p.description),
    certifications: cleanArr(src.certifications, (c) => ({ name: str(c.name), issuer: str(c.issuer), date: str(c.date) })).filter((c) => c.name),
    languages: cleanArr(src.languages, (l) => ({ name: str(l.name), level: str(l.level) })).filter((l) => l.name),
  };
}

export function resumeToPlainText(data) {
  const d = data || emptyResume();
  const lines = [];
  const b = d.basics || {};
  lines.push([b.name, b.jobTitle].filter(Boolean).join(" — "));
  lines.push(
    [b.email, b.phone, b.location, b.linkedin, b.github, b.website]
      .filter(Boolean)
      .join(" | "),
  );
  if (d.summary) lines.push("\nSUMMARY\n" + d.summary);
  if (d.experience?.length) {
    lines.push("\nEXPERIENCE");
    d.experience.forEach((e) => {
      lines.push(
        `${e.title}${e.company ? ", " + e.company : ""} (${e.startDate || ""} – ${e.current ? "Present" : e.endDate || ""})`,
      );
      (e.bullets || []).forEach((bl) => lines.push("• " + bl));
    });
  }
  if (d.education?.length) {
    lines.push("\nEDUCATION");
    d.education.forEach((e) =>
      lines.push(
        `${e.degree}${e.field ? " in " + e.field : ""}${e.school ? ", " + e.school : ""} (${e.startDate || ""} – ${e.endDate || ""})`,
      ),
    );
  }
  if (d.skills?.length) {
    lines.push(
      "\nSKILLS\n" +
        d.skills.map((s) => (typeof s === "string" ? s : s.name)).join(", "),
    );
  }
  if (d.projects?.length) {
    lines.push("\nPROJECTS");
    d.projects.forEach((p) =>
      lines.push(
        `${p.name}${p.tech ? " — " + p.tech : ""}\n  ${p.description || ""}`,
      ),
    );
  }
  if (d.certifications?.length) {
    lines.push("\nCERTIFICATIONS");
    d.certifications.forEach((c) =>
      lines.push(
        `${c.name}${c.issuer ? " — " + c.issuer : ""}${c.date ? " (" + c.date + ")" : ""}`,
      ),
    );
  }
  if (d.languages?.length) {
    lines.push(
      "\nLANGUAGES\n" +
        d.languages
          .map((l) => `${l.name}${l.level ? " (" + l.level + ")" : ""}`)
          .join(", "),
    );
  }
  return lines.filter(Boolean).join("\n");
}

export function monthYear(value) {
  if (!value) return "";
  const [y, m] = value.split("-");
  if (y && !m) return y;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const idx = parseInt(m, 10) - 1;
  return `${months[idx] || ""} ${y}`;
}

export function scoreTone(score) {
  if (score >= 80) return "green";
  if (score >= 60) return "amber";
  return "rose";
}
