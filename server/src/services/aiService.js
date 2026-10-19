import OpenAI from "openai";

// ---- Provider selection ------------------------------------------------
// Priority: an explicit provider override -> first usable live key -> mock.
// Auto-detect order: Gemini (free tier) -> Groq -> OpenAI.
const RAW_PROVIDER = process.env.AI_PROVIDER;
const AI_PROVIDER = RAW_PROVIDER == null ? "" : String(RAW_PROVIDER).trim().toLowerCase();

const OPENAI_KEY = process.env.OPENAI_API_KEY == null ? "" : String(process.env.OPENAI_API_KEY).trim();
const GROQ_KEY = process.env.GROQ_API_KEY == null ? "" : String(process.env.GROQ_API_KEY).trim();
const GEMINI_KEY = process.env.GEMINI_API_KEY == null ? "" : String(process.env.GEMINI_API_KEY).trim();
// AI_MOCK=true forces demo/mock mode even when a live key is configured.
const AI_FORCE_MOCK = /^(true|1|yes)$/i.test(String(process.env.AI_MOCK ?? "").trim());

// Gemini is called through Google's OpenAI-compatible endpoint, so the same
// OpenAI npm package works with no extra dependency.
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";
const GEMINI_DEFAULT_MODEL = "gemini-3.8-flash";
const GEMINI_FALLBACK_MODELS = [
  "gemini-3.8-flash",
  "gemini-3-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
];

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
// llama-3.3-70b-versatile was decommissioned by Groq on Aug 16, 2026.
// These are the current recommended chat models (tried in order).
const GROQ_DEFAULT_MODEL = "openai/gpt-oss-120b";
const GROQ_FALLBACK_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
  "llama-3.1-8b-instant",
];

function hasKey(value) {
  return value != null && String(value).trim().length > 0;
}

let provider = "openai";
let client = null;
let model = process.env.OPENAI_MODEL == null ? "gpt-4o-mini" : String(process.env.OPENAI_MODEL).trim() || "gpt-4o-mini";

function makeOpenAiClient(apiKey, baseURL) {
  const options = { apiKey: String(apiKey).trim() };
  if (baseURL) options.baseURL = baseURL;
  return new OpenAI(options);
}

const resolveGeminiModel = () =>
  process.env.GEMINI_MODEL == null ? GEMINI_DEFAULT_MODEL : String(process.env.GEMINI_MODEL).trim() || GEMINI_DEFAULT_MODEL;

if (AI_PROVIDER === "gemini") {
  provider = "gemini";
  model = resolveGeminiModel();
  if (hasKey(GEMINI_KEY)) {
    client = makeOpenAiClient(GEMINI_KEY, GEMINI_BASE_URL);
  }
} else if (AI_PROVIDER === "groq") {
  provider = "groq";
  model = process.env.GROQ_MODEL == null ? GROQ_DEFAULT_MODEL : String(process.env.GROQ_MODEL).trim() || GROQ_DEFAULT_MODEL;
  if (hasKey(GROQ_KEY)) {
    client = makeOpenAiClient(GROQ_KEY, GROQ_BASE_URL);
  }
} else if (AI_PROVIDER === "openai") {
  provider = "openai";
  model = process.env.OPENAI_MODEL == null ? "gpt-4o-mini" : String(process.env.OPENAI_MODEL).trim() || "gpt-4o-mini";
  if (hasKey(OPENAI_KEY)) {
    client = makeOpenAiClient(OPENAI_KEY, undefined);
  }
} else {
  // No explicit provider: use the first live key we recognize (Gemini first).
  if (hasKey(GEMINI_KEY)) {
    provider = "gemini";
    model = resolveGeminiModel();
    client = makeOpenAiClient(GEMINI_KEY, GEMINI_BASE_URL);
  } else if (hasKey(GROQ_KEY)) {
    provider = "groq";
    model = process.env.GROQ_MODEL == null ? GROQ_DEFAULT_MODEL : String(process.env.GROQ_MODEL).trim() || GROQ_DEFAULT_MODEL;
    client = makeOpenAiClient(GROQ_KEY, GROQ_BASE_URL);
  } else if (hasKey(OPENAI_KEY)) {
    provider = "openai";
    model = process.env.OPENAI_MODEL == null ? "gpt-4o-mini" : String(process.env.OPENAI_MODEL).trim() || "gpt-4o-mini";
    client = makeOpenAiClient(OPENAI_KEY, undefined);
  }
}

const MOCK = !client || AI_FORCE_MOCK;

const clip = (t, n) => (t || "").toString().slice(0, n);

/** Robustly parse JSON from an LLM response (handles ```json fences etc.) */
function parseJson(raw) {
  if (!raw) throw new Error("AI returned an empty response");
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start > 0 || end < text.length - 1) {
    if (start !== -1 && end !== -1) text = text.slice(start, end + 1);
  }
  try {
    return JSON.parse(text);
  } catch {
    // Try to parse first JSON object line-blocks fallback
    const err = new Error("AI returned invalid JSON");
    err.statusCode = 502;
    throw err;
  }
}

export function aiStatus() {
  return {
    mock: MOCK,
    provider,
    hasKey: Boolean(client),
    model: MOCK ? "mock" : model,
    connected: !MOCK,
  };
}

async function chatJson(
  systemPrompt,
  userPrompt,
  maxTokens = 2400,
  temperature = 0.4,
) {
  if (MOCK) throw new Error("__MOCK__");
  // Gemini thinking models count reasoning tokens toward max_tokens, so give
  // them a generous budget and cap thinking effort to keep responses fast.
  const isGemini = provider === "gemini";
  const payload = {
    temperature,
    max_tokens: isGemini ? Math.max(maxTokens * 2, 1600) : maxTokens,
    ...(isGemini ? { reasoning_effort: "low" } : {}),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };

  // Try the configured model, then known-good fallbacks, so a decommissioned
  // or renamed provider model degrades gracefully instead of breaking every
  // AI feature (Groq retired llama-3.3-70b-versatile in Aug 2026).
  const FALLBACK_MODELS = {
    gemini: GEMINI_FALLBACK_MODELS,
    groq: GROQ_FALLBACK_MODELS,
  };
  const candidates = [model, ...((FALLBACK_MODELS[provider] || []).filter((m) => m !== model))];
  let lastModelErr = null;
  for (let i = 0; i < candidates.length; i++) {
    // Attempt 1: provider JSON mode. Attempt 2: freeform + local JSON parsing.
    for (const useJsonMode of [true, false]) {
      try {
        const req = {
          model: candidates[i],
          ...payload,
        };
        if (useJsonMode) req.response_format = { type: "json_object" };
        const completion = await client.chat.completions.create(req);
        if (candidates[i] !== model) model = candidates[i]; // remember the working model
        return parseJson(completion.choices[0]?.message?.content);
      } catch (err) {
        if (useJsonMode && /failed_generation|json/i.test(String(err?.message || ""))) continue; // retry without JSON mode
        if (isModelMissingError(err) && i < candidates.length - 1) {
          lastModelErr = err;
          break; // move to the next candidate model
        }
        throw mapChatError(err);
      }
    }
  }
  throw mapChatError(lastModelErr);
}

/** True when a provider says the chosen model is missing, retired or blocked. */
function isModelMissingError(err) {
  const code = String(err?.code || "").toLowerCase();
  const msg = String(err?.message || "").toLowerCase();
  return (
    err?.status === 404 ||
    err?.status === 400 &&
      (code.includes("model") || msg.includes("does not exist")) ||
    code.includes("model_not_found") ||
    (msg.includes("model") && msg.includes("no longer"))
  );
}

/** Surface provider-specific API errors with clear, actionable messages. */
function mapChatError(err) {
    if (provider === "gemini") {
      const raw = String(err?.message || "");
      if (
        /api[_ ]key[_ ]not[_ ]valid|api_key_invalid|please pass a valid api key|invalid api key|400 status code \(no body\)/i.test(raw) ||
        err.status === 401 ||
        err.status === 403
      ) {
        const authErr = new Error(
          'Invalid Gemini API key. Check GEMINI_API_KEY in your server/.env file (get one free at https://aistudio.google.com/app/apikey).'
        );
        authErr.statusCode = 500;
        throw authErr;
      }
      if (err.status === 429) {
        const limitErr = new Error(
          'Gemini free-tier rate limit reached — it resets after the daily window. Remove the GEMINI_API_KEY comment or set GROQ_API_KEY so the app can fall back to Groq, or set AI_MOCK=true for demo mode.'
        );
        limitErr.statusCode = 429;
        throw limitErr;
      }
      if (err.status === 503 || /overloaded|unavailable/i.test(raw)) {
        const sErr = new Error('Gemini is temporarily overloaded. Please retry in a moment.');
        sErr.statusCode = 503;
        throw sErr;
      }
    }

    if (provider === "groq") {
      if (err.status === 401 || (err.code && /unauth/i.test(err.code))) {
        const authErr = new Error(
          'Invalid Groq API key. Check GROQ_API_KEY in your server/.env file.'
        );
        authErr.statusCode = 500;
        throw authErr;
      }
      if (err.status === 429) {
        const limitErr = new Error(
          'Groq free-tier rate limit reached. If you need higher limits, rotate to a different AI_PROVIDER or set AI_MOCK=true for demo mode.'
        );
        limitErr.statusCode = 429;
        throw limitErr;
      }
    }

    if (provider === "openai") {
      if (err.status === 429 || (err.code && /credit/i.test(err.code))) {
        const creditErr = new Error(
          'OpenAI credit balance exhausted. Add credits at https://platform.openai.com/settings/organization/billing/ or switch AI_PROVIDER=groq with a GROQ_API_KEY, or set AI_MOCK=true to use demo mode.'
        );
        creditErr.statusCode = 402;
        throw creditErr;
      }
      if (err.status === 401 || (err.code && /unauth/i.test(err.code))) {
        const authErr = new Error('Invalid OpenAI API key. Check OPENAI_API_KEY in your .env file.');
        authErr.statusCode = 500;
        throw authErr;
      }
    }

    throw err;
}

/* ------------------------------------------------------------------ */
/* Resume Analyzer                                                     */
/* ------------------------------------------------------------------ */

const ANALYSIS_SYSTEM = `You are an expert ATS (Applicant Tracking System) and resume strategist.
You analyze resumes against job descriptions. Reply ONLY with a valid JSON object using EXACTLY this shape:
{
  "overallScore": <integer 0-100>,
  "categories": [
    {"name": "Keyword Match", "score": <0-100>, "comment": "<short advice>"},
    {"name": "Impact & Achievements", "score": <0-100>, "comment": "<short advice>"},
    {"name": "Formatting & ATS Readability", "score": <0-100>, "comment": "<short advice>"},
    {"name": "Skills Coverage", "score": <0-100>, "comment": "<short advice>"},
    {"name": "Language & Professionalism", "score": <0-100>, "comment": "<short advice>"}
  ],
  "matchedKeywords": ["<keyword from the job description that the resume already covers>"],
  "missingKeywords": ["<important keywords/skills from the job description missing in the resume>"],
  "strengths": ["<specific strength>"],
  "weaknesses": ["<specific weakness>"],
  "quickFixes": [{"title": "<short fix title>", "detail": "<how to fix it, concrete>", "priority": "high|medium|low"}],
  "improvedSummary": "<a rewritten professional summary for this resume targeting the job>",
  "recruiterTip": "<one blunt tip a recruiter would give>"
}
All strings must be concise. Scores must be honest, not flattering. If no job description is provided, score against generic best practices for the role and infer keywords from the resume title/summary instead.`;

function mockAnalysis({ resumeText, jobDescription, jobTitle }) {
  const jd = (jobDescription || jobTitle || "").toLowerCase();
  const rt = (resumeText || "").toLowerCase();
  const pick = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
  const commonBuzz = [
    "leadership",
    "communication",
    "teamwork",
    "sql",
    "react",
    "python",
    "docker",
    "kubernetes",
    "agile",
    "stakeholders",
    "a/b testing",
    "ci/cd",
    "rest apis",
    "mentorship",
    "roadmap",
  ];
  const matched = commonBuzz.filter((k) => rt.includes(k)).slice(0, 6);
  const missing = commonBuzz
    .filter((k) => jd && jd.includes(k) && !rt.includes(k))
    .slice(0, 7);
  const overall = jd ? 55 + Math.floor(matched.length * 4) : 62;
  return {
    overallScore: Math.min(92, overall),
    categories: [
      {
        name: "Keyword Match",
        score: Math.min(95, 50 + matched.length * 6),
        comment:
          "Align resume wording with the exact phrases in the job description.",
      },
      {
        name: "Impact & Achievements",
        score: 58,
        comment:
          "Add measurable outcomes (%, $, time saved) to your bullet points.",
      },
      {
        name: "Formatting & ATS Readability",
        score: 72,
        comment:
          "Use standard section headings and avoid tables/columns for parsing.",
      },
      {
        name: "Skills Coverage",
        score: Math.min(90, 45 + matched.length * 7),
        comment: "List hard skills explicitly in a dedicated skills section.",
      },
      {
        name: "Language & Professionalism",
        score: 66,
        comment:
          "Start bullets with strong action verbs; remove personal pronouns.",
      },
    ],
    matchedKeywords: matched.length ? matched : pick(commonBuzz, 4),
    missingKeywords: missing.length
      ? missing
      : ["cross-functional collaboration", "metrics-driven", "automation"],
    strengths: ["Clear role progression", "Relevant technical background"],
    weaknesses: [
      "Bullets describe duties rather than achievements",
      "No quantified results detected",
    ],
    quickFixes: [
      {
        title: "Quantify your wins",
        detail:
          'Rewrite 3 bullets to include numbers, e.g. "Reduced load time by 35%".',
        priority: "high",
      },
      {
        title: "Mirror the job title",
        detail:
          "Include the exact job title you are applying for near the top of the resume.",
        priority: "high",
      },
      {
        title: "Trim to one page",
        detail: "Cut older or irrelevant roles to keep the resume concise.",
        priority: "medium",
      },
    ],
    improvedSummary:
      "Results-driven professional with proven experience delivering measurable impact across complex projects. Skilled at collaborating cross-functionally to ship high-quality work ahead of schedule.",
    recruiterTip:
      "A recruiter spends ~7 seconds scanning. Lead with your most impressive quantified achievement.",
  };
}

export async function analyzeResume({ resumeText, jobDescription, jobTitle }) {
  try {
    const userPrompt = `JOB TITLE (optional): ${clip(jobTitle, 100) || "(not provided)"}
JOB DESCRIPTION:
${clip(jobDescription, 7000) || "(not provided)"}

RESUME TEXT:
${clip(resumeText, 14000)}
Analyze this resume now.`;
    return await chatJson(ANALYSIS_SYSTEM, userPrompt, 2000, 0.3);
  } catch (err) {
    if (err.message === "__MOCK__")
      return mockAnalysis({ resumeText, jobDescription, jobTitle });
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Summary generator                                                   */
/* ------------------------------------------------------------------ */

export async function generateSummary({
  role,
  yearsExperience,
  skills,
  experience,
  tone,
}) {
  try {
    const data = await chatJson(
      `You are a professional resume writer. Reply ONLY with JSON: {"summary": "<3-4 sentence professional summary>", "alternatives": ["<shorter punchy variant>", "<concise variant under 200 chars>"]}`,
      `Write a resume professional summary.
Target role: ${clip(role, 100) || "the candidate target role"}
Years of experience: ${clip(yearsExperience, 20) || "unspecified"}
Tone: ${tone || "professional"}
Skills to weave in: ${clip(skills, 600) || "none listed"}
Experience context (titles/companies/bullets): ${clip(experience, 3000) || "none"}
Do not invent employers. Use strong adjectives and keep it ATS friendly.`,
      900,
    );
    return data;
  } catch (err) {
    if (err.message === "__MOCK__")
      return {
        summary: `${role || "Motivated professional"} with ${yearsExperience || "several"} years of experience delivering high-quality results. Skilled in ${skills || "modern tools and best practices"}, with a track record of collaborating cross-functionally and improving key metrics. Known for ownership, clear communication, and shipping under deadline pressure.`,
        alternatives: [
          `${role || "Professional"} focused on measurable impact, quality, and speed.`,
          "Experienced builder who turns complex requirements into shipped, reliable results.",
        ],
      };
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Bullet enhancer                                                     */
/* ------------------------------------------------------------------ */

export async function enhanceBullets({ bullets, role, jobDescription }) {
  try {
    const data = await chatJson(
      `You rewrite resume bullet points to be achievement-focused and metric-driven where plausible. Reply ONLY with JSON: {"bullets": ["<enhanced bullet 1>", ...]}. Keep facts intact; do not fabricate companies/dates; you may add plausible placeholder metrics in brackets like "(+~20%)" only if a generic estimate is optional. Never add fake numbers as facts.`,
      `Target role: ${clip(role, 100) || "unspecified"}
${jobDescription ? `Job description keywords to align with:\n${clip(jobDescription, 3000)}` : ""}
Rewrite these resume bullets:
${bullets.map((b, i) => `${i + 1}. ${clip(b, 300)}`).join("\n")}`,
      1400,
    );
    return data;
  } catch (err) {
    if (err.message === "__MOCK__")
      return {
        bullets: bullets.map((b) => {
          const clean = b
            .replace(/^(responsible for|worked on|helped with)\s*/i, "")
            .trim();
          return `${clean.charAt(0).toUpperCase()}${clean.slice(1)}, improving team throughput and quality through ownership and iteration.`;
        }),
      };
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Skill suggestions                                                   */
/* ------------------------------------------------------------------ */

export async function suggestSkills({ role, existingSkills, jobDescription }) {
  try {
    const data = await chatJson(
      `Reply ONLY with JSON: {"skills": [{"name": "<skill>", "reason": "<why it matters for the role>"}]} with at most 12 items, no duplicates of existing skills.`,
      `Target role: ${clip(role, 100)}
Existing skills (do not repeat): ${clip(existingSkills, 800) || "none"}
${jobDescription ? `Job description:\n${clip(jobDescription, 4000)}` : "Use typical high-value skills for this role."}`,
      900,
    );
    return data;
  } catch (err) {
    if (err.message === "__MOCK__")
      return {
        skills: [
          {
            name: "CI/CD pipelines",
            reason: "Automation of delivery is expected in most modern roles.",
          },
          {
            name: "Data analysis",
            reason: "Data-informed decisions are valued across functions.",
          },
          {
            name: "Cross-functional collaboration",
            reason: "Working with design, product and QA is universal.",
          },
          {
            name: "Agile / Scrum",
            reason: "Most teams work in agile sprints.",
          },
        ],
      };
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Resume tailoring (job match rewrite)                                */
/* ------------------------------------------------------------------ */

export async function tailorResume({ resume, jobDescription, jobTitle }) {
  try {
    const data = await chatJson(
      `You tailor an existing resume (given as JSON in a simplified format) to a job description.
Rewrite the summary and bullet points so they emphasize the keywords, requirements and outcomes in the job description.
Do NOT change company names, dates, employers or education. Do NOT invent experience.
Reply ONLY with JSON:
{
  "summary": "<rewritten summary>",
  "experience": [{"title": "...", "company": "...", "bullets": ["<rewritten bullet>", ...]}],
  "matchedKeywords": ["<keywords from the JD now covered>"],
  "notes": "<2-3 sentences explaining the main changes>"
}`,
      `TARGET ROLE: ${clip(jobTitle, 100) || "from job description"}
JOB DESCRIPTION:
${clip(jobDescription, 6000)}

CURRENT RESUME (JSON):
${clip(JSON.stringify(resume), 9000)}`,
      2800,
      0.35,
    );
    return data;
  } catch (err) {
    if (err.message === "__MOCK__")
      return {
        summary:
          "Tailored professional summary emphasizing the requirements from the job description (mock mode — connect an AI provider key for real AI tailoring).",
        experience: (resume?.experience || []).map((e) => ({
          ...e,
          bullets: e.bullets,
        })),
        matchedKeywords: ["stakeholders", "delivery", "quality"],
        notes:
          "Mock mode active. Add a live AI key (for example GROQ_API_KEY or OPENAI_API_KEY) to server/.env and keep AI_MOCK=false to enable real tailoring.",
      };
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Cover letter generator                                              */
/* ------------------------------------------------------------------ */

export async function generateCoverLetter({
  resume,
  resumeText,
  jobDescription,
  jobTitle,
  company,
  tone,
}) {
  try {
    const data = await chatJson(
      `You write compelling, non-generic cover letters. Reply ONLY with JSON: {"content": "<the full letter with greeting and sign-off, plain text with \\n\\n paragraphs>"}. Reference real details from the resume and job description. 250-350 words. No placeholders like [Company] — use the provided names; if a name is missing, write naturally around it.`,
      `Job title: ${clip(jobTitle, 100) || "(unknown)"}
Company: ${clip(company, 100) || "(unknown)"}
Tone: ${tone || "professional"}

JOB DESCRIPTION:
${clip(jobDescription, 5000) || "(not provided)"}

CANDIDATE RESUME:
${resume ? clip(JSON.stringify(resume), 8000) : clip(resumeText, 8000)}`,
      1500,
      0.7,
    );
    return data;
  } catch (err) {
    if (err.message === "__MOCK__")
      return {
        content:
          `Dear Hiring Team,\n\n` +
          `I'm excited to apply for the ${jobTitle || "open role"}${company ? ` at ${company}` : ""}. ` +
          `My experience aligns closely with what your team is looking for: significant hands-on work in the core areas of the role, a record of measurable results, and the collaboration style that modern teams thrive on.\n\n` +
          `In my recent work, I owned projects end to end — from understanding requirements to delivery and iteration — consistently improving quality and speed. I'd bring the same ownership and attention to detail to this position.\n\n` +
          `(Mock mode: add a live AI provider key to generate a fully personalized, AI-written letter.)\n\n` +
          `Sincerely,\nA Candidate`,
      };
    throw err;
  }
}
