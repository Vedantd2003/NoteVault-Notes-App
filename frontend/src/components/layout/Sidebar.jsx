import { StickyNote, Share2, Tag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV = [
  { key: 'all',    label: 'All Notes',     icon: StickyNote },
  { key: 'shared', label: 'Shared with me', icon: Share2 },
];

export default function Sidebar({
  activeView,
  onViewChange,
  tags,
  activeTag,
  onTagChange,
  mobileOpen,
  onMobileClose,
}) {
  const content = (
    <div className="flex flex-col h-full py-4 gap-1">
      <p className="px-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
        Views
      </p>

      {NAV.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => { onViewChange(key); onMobileClose?.(); }}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2 text-sm font-medium transition-colors ${
            activeView === key
              ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Icon size={16} className={activeView === key ? 'text-brand-500' : ''} />
          {label}
        </button>
      ))}

      {/* Tag filter section */}
      {tags.length > 0 && (
        <>
          <div className="my-2 mx-4 border-t border-gray-100 dark:border-gray-800" />
          <p className="px-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
            Tags
          </p>

          {/* "All tags" option */}
          <button
            onClick={() => { onTagChange(null); onMobileClose?.(); }}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl mx-2 text-sm transition-colors ${
              !activeTag
                ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Tag size={14} /> All tags
          </button>

          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => { onTagChange(tag); onMobileClose?.(); }}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl mx-2 text-sm transition-colors ${
                activeTag === tag
                  ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300">
                #
              </span>
              <span className="truncate">{tag}</span>
            </button>
          ))}
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto">
        {content}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 md:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">NoteVault</span>
                <button onClick={onMobileClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
