import { motion } from 'framer-motion';
import { StickyNote, Search } from 'lucide-react';
import Button from '../ui/Button.jsx';

export function EmptyNotes({ onCreateNote }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center mb-4">
        <StickyNote size={28} className="text-brand-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No notes yet</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
        Create your first note to get started. You can organise with colours and tags.
      </p>
      <Button onClick={onCreateNote}>Create note</Button>
    </motion.div>
  );
}

export function EmptySearch({ query }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Search size={28} className="text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No results found</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
        No notes match <span className="font-medium text-gray-700 dark:text-gray-300">"{query}"</span>.
        Try a different keyword.
      </p>
    </motion.div>
  );
}
