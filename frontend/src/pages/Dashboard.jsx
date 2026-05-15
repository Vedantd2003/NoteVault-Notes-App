import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Search, Menu } from 'lucide-react';

import { notesApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { apiErrorMessage } from '../utils/helpers.js';

import Navbar from '../components/layout/Navbar.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import NoteCard from '../components/notes/NoteCard.jsx';
import NoteModal from '../components/notes/NoteModal.jsx';
import ShareModal from '../components/notes/ShareModal.jsx';
import { EmptyNotes, EmptySearch } from '../components/notes/EmptyNotes.jsx';
import { NoteGridSkeleton } from '../components/ui/Skeleton.jsx';
import Button from '../components/ui/Button.jsx';

export default function Dashboard() {
  const { user } = useAuth();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [notes, setNotes]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // ── Filter / search state ────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  const [activeView, setActiveView]   = useState('all');   // 'all' | 'shared'
  const [activeTag, setActiveTag]     = useState(null);
  const searchQuery = useDebounce(searchInput, 380);

  // ── Modal state ──────────────────────────────────────────────────────────────
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote]     = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharingNote, setSharingNote]     = useState(null);
  const [saving, setSaving]               = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const allTags = useMemo(() => {
    const set = new Set(notes.map((n) => n.tag).filter(Boolean));
    return [...set].sort();
  }, [notes]);

  // ── Fetch notes ──────────────────────────────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 50 };
      if (searchQuery) params.q = searchQuery;
      if (activeTag)   params.tag = activeTag;

      const { data } = await notesApi.getAll(params);
      const filtered = activeView === 'shared'
        ? data.notes.filter((n) => n.is_shared)
        : data.notes;

      setNotes(filtered);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTag, activeView]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // ── Create / Edit ────────────────────────────────────────────────────────────
  const openCreate = () => { setEditingNote(null); setNoteModalOpen(true); };
  const openEdit   = (note) => { setEditingNote(note); setNoteModalOpen(true); };

  const handleSaveNote = async (payload) => {
    setSaving(true);
    try {
      if (editingNote) {
        const { data } = await notesApi.update(editingNote.id, payload);
        setNotes((prev) => prev.map((n) => (n.id === data.id ? data : n)));
        toast.success('Note updated');
      } else {
        const { data } = await notesApi.create(payload);
        setNotes((prev) => [data, ...prev]);
        toast.success('Note created');
      }
      setNoteModalOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    // Optimistic UI — remove immediately, restore on failure
    const snapshot = notes;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await notesApi.remove(id);
      toast.success('Note deleted');
    } catch (err) {
      setNotes(snapshot);
      toast.error(apiErrorMessage(err));
    }
  };

  // ── Pin toggle ───────────────────────────────────────────────────────────────
  const handleTogglePin = async (note) => {
    const updated = { ...note, is_pinned: !note.is_pinned };
    setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)));
    try {
      await notesApi.update(note.id, {
        title:     note.title,
        content:   note.content,
        color:     note.color,
        tag:       note.tag,
        is_pinned: !note.is_pinned,
      });
    } catch (err) {
      setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
      toast.error(apiErrorMessage(err));
    }
  };

  // ── Share ────────────────────────────────────────────────────────────────────
  const openShare = (note) => { setSharingNote(note); setShareModalOpen(true); };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const isOwner = (note) => note.owner_id === user?.id;

  // Sort: pinned first, then by updatedAt
  const sortedNotes = useMemo(() =>
    [...notes].sort((a, b) => {
      if (b.is_pinned !== a.is_pinned) return b.is_pinned ? 1 : -1;
      return new Date(b.updated_at) - new Date(a.updated_at);
    }),
  [notes]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        tags={allTags}
        activeTag={activeTag}
        onTagChange={setActiveTag}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

            {/* Top bar */}
            <div className="flex items-center gap-3 mb-6">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu size={18} />
              </button>

              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search notes…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Stats badge */}
              {!loading && (
                <span className="hidden sm:inline text-xs text-gray-400 dark:text-gray-500">
                  {sortedNotes.length} note{sortedNotes.length !== 1 ? 's' : ''}
                </span>
              )}

              <div className="ml-auto">
                <Button onClick={openCreate} size="sm">
                  <Plus size={15} /> New note
                </Button>
              </div>
            </div>

            {/* Active filter chips */}
            {(activeTag || activeView === 'shared' || searchQuery) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeView === 'shared' && (
                  <Chip label="Shared with me" onRemove={() => setActiveView('all')} />
                )}
                {activeTag && (
                  <Chip label={`#${activeTag}`} onRemove={() => setActiveTag(null)} />
                )}
                {searchQuery && (
                  <Chip label={`"${searchQuery}"`} onRemove={() => setSearchInput('')} />
                )}
              </div>
            )}

            {/* Content */}
            {loading ? (
              <NoteGridSkeleton count={6} />
            ) : sortedNotes.length === 0 ? (
              searchQuery
                ? <EmptySearch query={searchQuery} />
                : <EmptyNotes onCreateNote={openCreate} />
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {sortedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isOwner={isOwner(note)}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onShare={openShare}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <NoteModal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onSave={handleSaveNote}
        initialNote={editingNote}
        loading={saving}
      />
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        note={sharingNote}
      />
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-brand-900 dark:hover:text-brand-100 transition-colors">
        ×
      </button>
    </span>
  );
}
