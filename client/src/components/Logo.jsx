import { Link } from 'react-router-dom';

export default function Logo({ to = '/', text = true, className = '' }) {
  return (
    <Link to={to} className={`flex items-center gap-2.5 ${className}`}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-fuchsia-600 shadow-lg shadow-brand-600/30">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M6 5h12M6 10h12M6 15h7" />
          <path d="M15 18l2 2 4-4" strokeWidth="2.6" />
        </svg>
      </span>
      {text && (
        <span className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
          Resume<span className="text-gradient">Forge</span>
        </span>
      )}
    </Link>
  );
}
