import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pin, PinOff, Share2, Pencil, Trash2, Tag } from 'lucide-react';
import { NOTE_COLOR_CLASSES, relativeTime, contentPreview } from '../../utils/helpers.js';

export default function NoteCard({ note, onEdit, onDelete, onShare, onTogglePin, isOwner }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const colors = NOTE_COLOR_CLASSES[note.color] ?? NOTE_COLOR_CLASSES.default;

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(note.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className={`group relative rounded-2xl border p-5 flex flex-col gap-3 shadow-card hover:shadow-card-hover transition-shadow duration-200 ${colors.card}`}
    >
      {/* Pinned indicator stripe */}
      {note.is_pinned && (
        <div className="absolute top-0 left-5 right-5 h-0.5 rounded-full bg-brand-400 opacity-60" />
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 flex-1">
          {note.title}
        </h3>
        {/* Pin toggle — only owner can pin */}
        {isOwner && (
          <button
            onClick={() => onTogglePin(note)}
            title={note.is_pinned ? 'Unpin' : 'Pin'}
            className="p-1 rounded-lg text-gray-400 hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
          >
            {note.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
        )}
      </div>

      {/* Content preview */}
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1 line-clamp-4">
        {contentPreview(note.content)}
      </p>

      {/* Tag badge */}
      {note.tag && (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 w-fit font-medium">
          <Tag size={10} />
          {note.tag}
        </span>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5">
        <span className="text-[11px] text-gray-400 dark:text-gray-500">
          {note.is_shared
            ? `Shared by ${note.owner_email ?? 'someone'}`
            : relativeTime(note.updated_at)}
        </span>

        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {isOwner && (
            <button
              onClick={() => onShare(note)}
              title="Share"
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              <Share2 size={13} />
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => onEdit(note)}
              title="Edit"
              className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
            >
              <Pencil size={13} />
            </button>
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              title={confirmDelete ? 'Click again to confirm' : 'Delete'}
              className={`p-1.5 rounded-lg transition-colors ${
                confirmDelete
                  ? 'text-red-600 bg-red-50 dark:bg-red-950/40'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
              }`}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
