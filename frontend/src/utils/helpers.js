/**
 * Maps a note color key to Tailwind CSS classes for the card background and border.
 */
export const NOTE_COLOR_CLASSES = {
  default: {
    card:   'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    dot:    'bg-gray-400',
    label:  'Default',
  },
  red: {
    card:   'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800',
    dot:    'bg-red-400',
    label:  'Red',
  },
  orange: {
    card:   'bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800',
    dot:    'bg-orange-400',
    label:  'Orange',
  },
  yellow: {
    card:   'bg-yellow-50 dark:bg-yellow-950/60 border-yellow-200 dark:border-yellow-800',
    dot:    'bg-yellow-400',
    label:  'Yellow',
  },
  green: {
    card:   'bg-green-50 dark:bg-green-950/60 border-green-200 dark:border-green-800',
    dot:    'bg-green-400',
    label:  'Green',
  },
  blue: {
    card:   'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    dot:    'bg-blue-400',
    label:  'Blue',
  },
  purple: {
    card:   'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    dot:    'bg-purple-400',
    label:  'Purple',
  },
  pink: {
    card:   'bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800',
    dot:    'bg-pink-400',
    label:  'Pink',
  },
};

export const COLOR_KEYS = Object.keys(NOTE_COLOR_CLASSES);

/** Format a datetime string to a human-readable relative time. */
export function relativeTime(iso) {
  const now   = Date.now();
  const then  = new Date(iso).getTime();
  const delta = Math.floor((now - then) / 1000);

  if (delta < 60)    return 'just now';
  if (delta < 3600)  return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  if (delta < 604800) return `${Math.floor(delta / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Extract a short preview from note content (first 120 chars). */
export function contentPreview(content, length = 120) {
  if (!content) return '';
  const stripped = content.replace(/\n+/g, ' ').trim();
  return stripped.length > length ? stripped.slice(0, length) + '…' : stripped;
}

/** Get the first error message from an Axios error response. */
export function apiErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return 'Something went wrong. Please try again.';
  if (data.error)   return data.error;
  if (data.message) return data.message;
  if (Array.isArray(data.errors) && data.errors.length > 0) return data.errors[0].msg;
  return 'Something went wrong. Please try again.';
}
