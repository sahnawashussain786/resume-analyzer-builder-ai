import { useEffect, useRef, useState } from 'react';
import { monthYear, normalizeResume } from '../../utils/resume.js';

/**
 * Scales a fixed A4-width (794px) document to fit its container.
 */
function useFitScale() {
  const outerRef = useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      if (!outerRef.current) return;
      const w = outerRef.current.clientWidth;
      setScale(Math.min(1, (w - 8) / 794));
    };
    update();
    const ro = new ResizeObserver(update);
    if (outerRef.current) ro.observe(outerRef.current);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);
  return { outerRef, scale };
}

export function FitBox({ children, className = '' }) {
  const { outerRef, scale } = useFitScale();
  return (
    <div ref={outerRef} className={`w-full overflow-hidden ${className}`}>
      <div style={{ height: 1123 * scale || undefined }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 794 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Section({ title, accent, children, underline }) {
  return (
    <section className="mb-4">
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: accent, borderBottom: underline ? `1.5px solid ${accent}22` : 'none', paddingBottom: 3 }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Bullets({ bullets, dotColor, serif }) {
  if (!bullets?.length) return null;
  return (
    <ul className="mt-1 space-y-1">
      {bullets.map((b, i) => (
        <li key={i} className={`flex gap-1.5 text-[11.5px] leading-snug ${serif ? 'font-serif' : ''}`} style={{ color: '#374151' }}>
          <span style={{ color: dotColor, flexShrink: 0 }}>▪</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

function DateRange({ item }) {
  if (!item || typeof item !== 'object') return '';
  const s = monthYear(item.startDate);
  const e = item.current ? 'Present' : monthYear(item.endDate);
  return s || e ? `${s}${s && e ? ' — ' : ''}${e}` : '';
}

const headerContact = (basics) =>
  [basics.email, basics.phone, basics.location, basics.linkedin, basics.github, basics.website].filter(Boolean);

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

function Modern({ d, a }) {
  const b = d.basics || {};
  return (
    <div className="h-full bg-white" style={{ colorScheme: 'light' }}>
      <header className="px-10 pb-6 pt-9 text-white" style={{ background: `linear-gradient(120deg, ${a}, ${a}dd)` }}>
        <h1 className="font-display text-[30px] font-extrabold leading-tight">{b.name || 'Your Name'}</h1>
        {b.jobTitle && <p className="mt-1 text-[15px] font-medium opacity-90">{b.jobTitle}</p>}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] opacity-90">
          {headerContact(b).map((c, i) => <span key={i}>{c}</span>)}
        </div>
      </header>
      <main className="px-10 py-6">
        {d.summary && <Section title="Summary" accent={a}><p className="text-[12px] leading-relaxed text-gray-600">{d.summary}</p></Section>}
        {d.experience?.length > 0 && (
          <Section title="Experience" accent={a}>
            {d.experience.map((e, i) => (
              <div key={i} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-[13px] font-bold text-gray-800">{e.title}{e.company && <span style={{ color: a }}> · {e.company}</span>}</p>
                  <span className="shrink-0 text-[10.5px] font-medium text-gray-500">{DateRange(e)}</span>
                </div>
                {e.location && <p className="text-[10.5px] italic text-gray-400">{e.location}</p>}
                <Bullets bullets={e.bullets} dotColor={a} />
              </div>
            ))}
          </Section>
        )}
        {d.education?.length > 0 && (
          <Section title="Education" accent={a}>
            {d.education.map((e, i) => (
              <div key={i} className="mb-1.5 flex items-baseline justify-between">
                <p className="text-[12px] font-semibold text-gray-800">
                  {e.degree}{e.field && `, ${e.field}`}{e.school && <span className="font-normal"> — {e.school}</span>}
                </p>
                <span className="text-[10.5px] text-gray-500">{DateRange(e)}</span>
              </div>
            ))}
          </Section>
        )}
        {d.skills?.length > 0 && (
          <Section title="Skills" accent={a}>
            <div className="flex flex-wrap gap-1.5">
              {d.skills.map((s, i) => (
                <span key={i} className="rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ background: `${a}14`, color: a }}>
                  {typeof s === 'string' ? s : s.name}
                </span>
              ))}
            </div>
          </Section>
        )}
        {d.projects?.length > 0 && (
          <Section title="Projects" accent={a}>
            {d.projects.map((p, i) => (
              <div key={i} className="mb-2">
                <p className="text-[12px] font-bold text-gray-800">{p.name}{p.tech && <span className="ml-1.5 text-[10px] font-medium text-gray-400">{p.tech}</span>}</p>
                <p className="text-[11.5px] leading-snug text-gray-600">{p.description}</p>
                {p.link && <p className="text-[10px]" style={{ color: a }}>{p.link}</p>}
              </div>
            ))}
          </Section>
        )}
        {(d.certifications?.length > 0 || d.languages?.length > 0) && (
          <Section title={d.certifications?.length && d.languages?.length ? 'Certifications & Languages' : d.certifications?.length ? 'Certifications' : 'Languages'} accent={a}>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[11px] text-gray-600">
              {(d.certifications || []).map((c, i) => (
                <p key={i}>🏅 <strong className="font-semibold">{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ''}</p>
              ))}
              {(d.languages || []).map((l, i) => (
                <p key={i}>🌐 {l.name}{l.level && <span className="text-gray-400"> — {l.level}</span>}</p>
              ))}
            </div>
          </Section>
        )}
      </main>
    </div>
  );
}

function Classic({ d, a }) {
  const b = d.basics || {};
  return (
    <div className="h-full bg-white px-12 py-10 font-serif" style={{ colorScheme: 'light' }}>
      <header className="mb-5 text-center" style={{ borderBottom: `2.5px solid ${a}`, paddingBottom: 14 }}>
        <h1 className="text-[30px] font-bold tracking-wide" style={{ color: '#1f2937' }}>{b.name || 'Your Name'}</h1>
        {b.jobTitle && <p className="mt-0.5 text-[13.5px] uppercase tracking-[0.2em]" style={{ color: a }}>{b.jobTitle}</p>}
        <p className="mt-2 text-[11px] text-gray-500">{headerContact(b).join('  •  ')}</p>
      </header>
      {d.summary && <Section title="Professional Summary" accent={a} serif><p className="text-center text-[12px] leading-relaxed text-gray-600">{d.summary}</p></Section>}
      {d.experience?.length > 0 && (
        <Section title="Experience" accent={a} serif>
          {d.experience.map((e, i) => (
            <div key={i} className="mb-3.5">
              <div className="flex items-baseline justify-between">
                <p className="text-[13px] font-bold" style={{ color: '#1f2937' }}>{e.title}</p>
                <span className="text-[10.5px] text-gray-500">{DateRange(e)}</span>
              </div>
              <p className="text-[11.5px] italic" style={{ color: a }}>{e.company}{e.location && ` — ${e.location}`}</p>
              <Bullets bullets={e.bullets} dotColor="#6b7280" serif />
            </div>
          ))}
        </Section>
      )}
      {d.education?.length > 0 && (
        <Section title="Education" accent={a} serif>
          {d.education.map((e, i) => (
            <div key={i} className="mb-2 flex items-baseline justify-between">
              <p className="text-[12.5px] font-semibold" style={{ color: '#1f2937' }}>{e.degree}{e.field && `, ${e.field}`}{e.school && ` — ${e.school}`}</p>
              <span className="text-[10.5px] text-gray-500">{DateRange(e)}</span>
            </div>
          ))}
        </Section>
      )}
      {d.skills?.length > 0 && (
        <Section title="Skills" accent={a} serif>
          <p className="text-[11.5px] leading-relaxed text-gray-600">{d.skills.map((s) => (typeof s === 'string' ? s : s.name)).join('  ·  ')}</p>
        </Section>
      )}
      {d.projects?.length > 0 && (
        <Section title="Projects" accent={a} serif>
          {d.projects.map((p, i) => (
            <div key={i} className="mb-2 text-[11.5px] text-gray-600">
              <strong style={{ color: '#1f2937' }}>{p.name}</strong>{p.tech && <em> — {p.tech}</em>}
              {p.description && <p>{p.description}</p>}
            </div>
          ))}
        </Section>
      )}
      {d.certifications?.length > 0 && (
        <Section title="Certifications" accent={a} serif>
          {d.certifications.map((c, i) => (
            <p key={i} className="text-[11.5px] text-gray-600">{c.name}{c.issuer && ` — ${c.issuer}`}{c.date && ` (${monthYear(c.date)})`}</p>
          ))}
        </Section>
      )}
      {d.languages?.length > 0 && (
        <Section title="Languages" accent={a} serif>
          <p className="text-[11.5px] text-gray-600">{d.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ''}`).join(' · ')}</p>
        </Section>
      )}
    </div>
  );
}

function Minimal({ d, a }) {
  const b = d.basics || {};
  return (
    <div className="h-full bg-white px-11 py-9" style={{ colorScheme: 'light' }}>
      <header className="mb-4">
        <h1 className="text-[28px] font-bold" style={{ color: '#111827' }}>{b.name || 'Your Name'}</h1>
        {b.jobTitle && <p className="mt-0.5 text-[13px] font-medium" style={{ color: a }}>{b.jobTitle}</p>}
        <p className="mt-2 text-[10.5px] leading-relaxed text-gray-500">{headerContact(b).join('   |   ')}</p>
      </header>
      {d.summary && <Section title="Summary" accent="#374151"><p className="text-[12px] leading-relaxed text-gray-600">{d.summary}</p></Section>}
      {d.experience?.length > 0 && (
        <Section title="Experience" accent="#374151">
          {d.experience.map((e, i) => (
            <div key={i} className="mb-3 border-l-2 pl-3" style={{ borderColor: `${a}55` }}>
              <div className="flex items-baseline justify-between">
                <p className="text-[12.5px] font-bold" style={{ color: '#1f2937' }}>{e.title}, {e.company}</p>
                <span className="text-[10px] text-gray-400">{DateRange(e)}</span>
              </div>
              <Bullets bullets={e.bullets} dotColor={a} />
            </div>
          ))}
        </Section>
      )}
      {d.education?.length > 0 && (
        <Section title="Education" accent="#374151">
          {d.education.map((e, i) => (
            <div key={i} className="mb-1.5">
              <p className="text-[12px] font-semibold" style={{ color: '#1f2937' }}>{e.degree}{e.field && `, ${e.field}`}</p>
              <p className="text-[11px] text-gray-500">{e.school} · {DateRange(e)}</p>
            </div>
          ))}
        </Section>
      )}
      {d.skills?.length > 0 && (
        <Section title="Skills" accent="#374151">
          <p className="text-[11px] leading-relaxed text-gray-600">{d.skills.map((s) => (typeof s === 'string' ? s : s.name)).join('  |  ')}</p>
        </Section>
      )}
      {d.projects?.length > 0 && (
        <Section title="Projects" accent="#374151">
          {d.projects.map((p, i) => (
            <div key={i} className="mb-2 text-[11.5px] text-gray-600">
              <strong style={{ color: '#1f2937' }}>{p.name}</strong> {p.tech && <span className="text-gray-400">· {p.tech}</span>}<br />{p.description}
            </div>
          ))}
        </Section>
      )}
      {d.certifications?.length > 0 && (
        <Section title="Certifications" accent="#374151">
          {d.certifications.map((c, i) => <p key={i} className="text-[11px] text-gray-600">{c.name} — {c.issuer}{c.date && ` · ${monthYear(c.date)}`}</p>)}
        </Section>
      )}
      {d.languages?.length > 0 && (
        <Section title="Languages" accent="#374151">
          <p className="text-[11px] text-gray-600">{d.languages.map((l) => `${l.name} (${l.level})`).join(' | ')}</p>
        </Section>
      )}
    </div>
  );
}

function Elegant({ d, a }) {
  const b = d.basics || {};
  const skills = (d.skills || []).map((s) => (typeof s === 'string' ? s : s.name));
  return (
    <div className="h-full bg-white" style={{ colorScheme: 'light' }}>
      <div className="flex h-full">
        <aside className="w-[36%] py-9 pl-8 pr-6 text-white" style={{ background: a }}>
          <h1 className="font-display text-[24px] font-extrabold leading-tight">{b.name || 'Your Name'}</h1>
          {b.jobTitle && <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest opacity-85">{b.jobTitle}</p>}
          <div className="mt-6 space-y-4 text-[10.5px]">
            {headerContact(b).length > 0 && (
              <div className="space-y-1.5 opacity-95">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-70 border-b border-white/20 pb-1">Contact</p>
                {headerContact(b).map((c, i) => <p key={i} className="break-all">{c}</p>)}
              </div>
            )}
            {skills.length > 0 && (
              <div>
                <p className="border-b border-white/20 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">Skills</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {skills.map((s, i) => (
                    <span key={i} className="rounded-md bg-white/15 px-2 py-0.5 text-[9.5px] font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {d.languages?.length > 0 && (
              <div>
                <p className="border-b border-white/20 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">Languages</p>
                <div className="mt-1.5 space-y-1">
                  {d.languages.map((l, i) => <p key={i}>{l.name}<span className="opacity-60"> — {l.level}</span></p>)}
                </div>
              </div>
            )}
            {d.certifications?.length > 0 && (
              <div>
                <p className="border-b border-white/20 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">Certifications</p>
                <div className="mt-1.5 space-y-1.5">
                  {d.certifications.map((c, i) => <p key={i} className="leading-snug">{c.name}{c.issuer && <span className="opacity-70"> — {c.issuer}</span>}</p>)}
                </div>
              </div>
            )}
          </div>
        </aside>
        <main className="flex-1 px-8 py-9">
          {d.summary && <Section title="About" accent={a}><p className="text-[12px] leading-relaxed text-gray-600">{d.summary}</p></Section>}
          {d.experience?.length > 0 && (
            <Section title="Experience" accent={a}>
              {d.experience.map((e, i) => (
                <div key={i} className="mb-3">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[13px] font-bold" style={{ color: '#1f2937' }}>{e.title}</p>
                    <span className="text-[10px] text-gray-500">{DateRange(e)}</span>
                  </div>
                  <p className="text-[11px] font-medium" style={{ color: a }}>{e.company}{e.location && <span className="text-gray-400"> · {e.location}</span>}</p>
                  <Bullets bullets={e.bullets} dotColor={a} />
                </div>
              ))}
            </Section>
          )}
          {d.projects?.length > 0 && (
            <Section title="Projects" accent={a}>
              {d.projects.map((p, i) => (
                <div key={i} className="mb-2">
                  <p className="text-[12px] font-bold" style={{ color: '#1f2937' }}>{p.name} <span className="text-[9.5px] font-normal text-gray-400">{p.tech}</span></p>
                  <p className="text-[11px] leading-snug text-gray-600">{p.description}</p>
                </div>
              ))}
            </Section>
          )}
          {d.education?.length > 0 && (
            <Section title="Education" accent={a}>
              {d.education.map((e, i) => (
                <div key={i} className="mb-1.5">
                  <p className="text-[12px] font-semibold" style={{ color: '#1f2937' }}>{e.degree}{e.field && `, ${e.field}`}</p>
                  <p className="text-[10.5px] text-gray-500">{e.school} · {DateRange(e)}</p>
                </div>
              ))}
            </Section>
          )}
        </main>
      </div>
    </div>
  );
}

function Compact({ d, a }) {
  const b = d.basics || {};
  return (
    <div className="h-full bg-white px-9 py-7" style={{ colorScheme: 'light' }}>
      <header className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold leading-tight" style={{ color: '#111827' }}>{b.name || 'Your Name'}</h1>
          {b.jobTitle && <p className="text-[12px] font-semibold" style={{ color: a }}>{b.jobTitle}</p>}
        </div>
        <p className="max-w-[55%] text-right text-[9.5px] leading-relaxed text-gray-500">{headerContact(b).join(' · ')}</p>
      </header>
      <div className="mb-3 h-[3px] w-full rounded-full" style={{ background: `linear-gradient(90deg, ${a}, ${a}33)` }} />
      {d.summary && <p className="mb-3 text-[11px] leading-snug text-gray-600">{d.summary}</p>}
      {d.experience?.length > 0 && (
        <Section title="Experience" accent={a}>
          {d.experience.map((e, i) => (
            <div key={i} className="mb-2">
              <div className="flex items-baseline justify-between">
                <p className="text-[11.5px] font-bold" style={{ color: '#1f2937' }}>{e.title} · {e.company}</p>
                <span className="text-[9.5px] text-gray-500">{DateRange(e)}</span>
              </div>
              <Bullets bullets={e.bullets} dotColor={a} />
            </div>
          ))}
        </Section>
      )}
      {d.education?.length > 0 && (
        <Section title="Education" accent={a}>
          {d.education.map((e, i) => (
            <p key={i} className="mb-0.5 text-[11px] text-gray-700">
              <strong>{e.degree}{e.field && `, ${e.field}`}</strong> — {e.school} <span className="text-gray-400">({DateRange(e)})</span>
            </p>
          ))}
        </Section>
      )}
      {d.skills?.length > 0 && (
        <Section title="Skills" accent={a}>
          <p className="text-[10.5px] text-gray-600">{d.skills.map((s) => (typeof s === 'string' ? s : s.name)).join(' · ')}</p>
        </Section>
      )}
      {d.projects?.length > 0 && (
        <Section title="Projects" accent={a}>
          {d.projects.map((p, i) => (
            <p key={i} className="mb-1 text-[10.5px] text-gray-600"><strong style={{ color: '#1f2937' }}>{p.name}</strong>{p.tech && <span className="text-gray-400"> — {p.tech}</span>} — {p.description}</p>
          ))}
        </Section>
      )}
      {(d.certifications?.length > 0 || d.languages?.length > 0) && (
        <Section title="Extras" accent={a}>
          <p className="text-[10.5px] text-gray-600">
            {[...(d.certifications || []).map((c) => `${c.name}${c.issuer ? ` (${c.issuer})` : ''}`), ...(d.languages || []).map((l) => `${l.name}: ${l.level}`)].join(' · ')}
          </p>
        </Section>
      )}
    </div>
  );
}

const TEMPLATE_COMPONENTS = { modern: Modern, classic: Classic, minimal: Minimal, elegant: Elegant, compact: Compact };

export default function ResumePreview({ data, template = 'modern', accent = '#6366f1' }) {
  const Template = TEMPLATE_COMPONENTS[template] || Modern;
  const d = normalizeResume(data);
  return (
    <div
      id="resume-document"
      className="shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)]"
      style={{ width: 794, height: 1123, overflow: 'hidden' }}
    >
      <Template d={data} a={accent} />
    </div>
  );
}
