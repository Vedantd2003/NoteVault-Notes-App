import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StickyNote, Share2, Pin, Tag, ArrowRight, Moon } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

const FEATURES = [
  { icon: Pin,       title: 'Pin important notes',   desc: 'Keep what matters at the top of your list.' },
  { icon: Tag,       title: 'Organise with tags',    desc: 'Group notes by topic and filter instantly.' },
  { icon: Share2,    title: 'Share with anyone',     desc: 'Collaborate by sharing notes with other users.' },
  { icon: Moon,      title: 'Dark mode',             desc: 'Easy on the eyes, day or night.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white">NoteVault</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 mb-6">
            <StickyNote size={11} /> Multi-user notes app
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight text-balance mb-5">
            Your thoughts,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-purple-600">
              beautifully organised
            </span>
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8 text-balance">
            Create, colour-code, tag, pin, and share notes with your team. Everything you need, nothing you don't.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/register">
              <Button size="lg">
                Start for free <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">Sign in</Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-20 w-full"
        >
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 shadow-sm text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center">
                <Icon size={18} className="text-brand-500" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400 dark:text-gray-600">
        Built by Vedant Deshpande · NoteVault 2025
      </footer>
    </div>
  );
}
