import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              AI-powered resume builder and ATS analyzer. Build beautiful, tailored resumes, beat the
              ATS bots, and land more interviews.
            </p>
            <div className="mt-5 flex gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="rounded-xl bg-slate-900 p-2.5 transition hover:bg-slate-800 hover:text-white">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/builder" className="hover:text-white">Resume Builder</Link></li>
              <li><Link to="/analyzer" className="hover:text-white">ATS Analyzer</Link></li>
              <li><Link to="/coverletters" className="hover:text-white">Cover Letters</Link></li>
              <li><Link to="/templates" className="hover:text-white">Templates</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} ResumeForge. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted with <Heart size={12} className="text-rose-500" fill="currentColor" /> for job seekers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
