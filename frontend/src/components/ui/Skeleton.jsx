function Pulse({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 ${className}`} />
  );
}

export function NoteCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-3">
      <div className="flex items-start justify-between">
        <Pulse className="h-4 w-2/3" />
        <Pulse className="h-5 w-5 rounded-full" />
      </div>
      <Pulse className="h-3 w-full" />
      <Pulse className="h-3 w-4/5" />
      <Pulse className="h-3 w-3/5" />
      <div className="flex items-center justify-between pt-2">
        <Pulse className="h-3 w-20" />
        <Pulse className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function NoteGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </div>
  );
}
