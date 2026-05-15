import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, Mail, Pin, Tag, Palette, Search } from 'lucide-react';

const FEATURES = [
  {
    icon: Pin,
    name: 'Pin Notes',
    desc: 'Mark critical notes as pinned — they always float to the top of your dashboard. One click to pin, one click to unpin.',
  },
  {
    icon: Palette,
    name: 'Colour Labels',
    desc: '8 pastel colour options let you visually scan your notes at a glance without opening them.',
  },
  {
    icon: Tag,
    name: 'Tags & Filtering',
    desc: 'Assign a free-text tag to any note (e.g. "work", "ideas") and filter the sidebar to show only that category.',
  },
  {
    icon: Search,
    name: 'Debounced Search',
    desc: 'Real-time search fires 380 ms after you stop typing — no unnecessary API calls, instant-feeling results.',
  },
];

const TECH = [
  { label: 'Frontend',  value: 'React 18 + Vite, Tailwind CSS, Framer Motion' },
  { label: 'Backend',   value: 'Node.js, Express.js (ES modules)' },
  { label: 'Database',  value: 'MongoDB + Mongoose ODM' },
  { label: 'Auth',      value: 'JWT (7-day expiry) + bcrypt (cost 12)' },
  { label: 'Security',  value: 'Helmet, CORS, rate limiting, input sanitisation' },
  { label: 'Deploy',    value: 'Frontend → Vercel, Backend → Render' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-7 mb-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                V
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Vedant Deshpande</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Full-stack Developer</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href="mailto:abc844023@gmail.com"
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                <Mail size={14} /> abc844023@gmail.com
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                <Github size={14} /> github.com/vedant-deshpande
              </a>
            </div>
          </div>

          {/* Extra feature section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-7 mb-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Extra Feature — Smart Note Organisation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURES.map(({ icon: Icon, name, desc }) => (
                <div key={name} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={15} className="text-brand-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-7">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Tech Stack</h2>
            <div className="flex flex-col gap-3">
              {TECH.map(({ label, value }) => (
                <div key={label} className="flex gap-3 text-sm">
                  <span className="w-24 shrink-0 text-gray-500 dark:text-gray-400 font-medium">{label}</span>
                  <span className="text-gray-700 dark:text-gray-300">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
