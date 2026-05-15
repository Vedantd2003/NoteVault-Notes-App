import { useState, useEffect } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Input, { Textarea } from '../ui/Input.jsx';
import { NOTE_COLOR_CLASSES, COLOR_KEYS } from '../../utils/helpers.js';

const MAX_CONTENT = 50000;

export default function NoteModal({ open, onClose, onSave, initialNote, loading }) {
  const isEdit = Boolean(initialNote?.id);

  const [form, setForm] = useState({
    title: '',
    content: '',
    color: 'default',
    tag: '',
    is_pinned: false,
  });
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (open) {
      setForm({
        title:     initialNote?.title    ?? '',
        content:   initialNote?.content  ?? '',
        color:     initialNote?.color    ?? 'default',
        tag:       initialNote?.tag      ?? '',
        is_pinned: initialNote?.is_pinned ?? false,
      });
      setErrors({});
    }
  }, [open, initialNote]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim())   errs.title   = 'Title is required';
    if (!form.content.trim()) errs.content = 'Content is required';
    if (form.content.length > MAX_CONTENT) errs.content = 'Content too long';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      title:     form.title.trim(),
      content:   form.content.trim(),
      color:     form.color,
      tag:       form.tag.trim() || null,
      is_pinned: form.is_pinned,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Note' : 'New Note'}
      maxWidth="max-w-xl"
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="Note title…"
          value={form.title}
          onChange={set('title')}
          error={errors.title}
          maxLength={255}
          autoFocus
        />

        <div className="flex flex-col gap-1">
          <Textarea
            label="Content"
            placeholder="Write something…"
            value={form.content}
            onChange={set('content')}
            error={errors.content}
            rows={6}
            maxLength={MAX_CONTENT}
          />
          {/* Character counter */}
          <p className="text-xs text-gray-400 text-right">
            {form.content.length.toLocaleString()} / {MAX_CONTENT.toLocaleString()}
          </p>
        </div>

        {/* Colour picker */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Colour</span>
          <div className="flex flex-wrap gap-2">
            {COLOR_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => setForm((p) => ({ ...p, color: key }))}
                title={NOTE_COLOR_CLASSES[key].label}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  NOTE_COLOR_CLASSES[key].dot
                } ${
                  form.color === key
                    ? 'border-gray-800 dark:border-white scale-125'
                    : 'border-transparent hover:scale-110'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Tag + Pin row */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              label="Tag (optional)"
              placeholder="work, personal, ideas…"
              value={form.tag}
              onChange={set('tag')}
              maxLength={50}
            />
          </div>
          <label className="flex items-center gap-2 pb-2.5 cursor-pointer select-none text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
            <input
              type="checkbox"
              checked={form.is_pinned}
              onChange={(e) => setForm((p) => ({ ...p, is_pinned: e.target.checked }))}
              className="w-4 h-4 rounded accent-brand-600"
            />
            Pin note
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {isEdit ? 'Save changes' : 'Create note'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
