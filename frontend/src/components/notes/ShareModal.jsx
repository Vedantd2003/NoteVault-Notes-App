import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import { notesApi } from '../../api/index.js';
import { apiErrorMessage } from '../../utils/helpers.js';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

export default function ShareModal({ open, onClose, note }) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleClose = () => {
    setEmail('');
    setError('');
    onClose();
  };

  const handleShare = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await notesApi.share(note.id, { share_with_email: trimmed });
      toast.success(`Note shared with ${trimmed}`);
      handleClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleShare();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Share Note">
      <div className="flex flex-col gap-4">
        {note && (
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Sharing</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {note.title}
            </p>
          </div>
        )}

        <Input
          label="Share with (email)"
          type="email"
          placeholder="colleague@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          error={error}
          autoFocus
        />

        <p className="text-xs text-gray-400 dark:text-gray-500">
          The user must already have a NoteVault account. They will be able to read this note but not edit or delete it.
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleShare} loading={loading}>
            <UserPlus size={14} /> Share
          </Button>
        </div>
      </div>
    </Modal>
  );
}
