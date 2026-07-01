import { useEffect, useMemo, useRef, useState } from "react";
import type { Exercise } from "../types";
import ExerciseCard from "./ExerciseCard";

interface Props {
  items: Exercise[];
  favoriteIds: Set<string>;
  sessionIds: Set<string>;
  onOpen: (ex: Exercise) => void;
  onToggleSession: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const PAGE = 24;

export default function ExerciseGrid({
  items,
  favoriteIds,
  sessionIds,
  onOpen,
  onToggleSession,
  onToggleFavorite,
}: Props) {
  const [limit, setLimit] = useState(PAGE);
  const sentinel = useRef<HTMLDivElement | null>(null);

  // Reset paging whenever the filtered set changes.
  useEffect(() => {
    setLimit(PAGE);
  }, [items]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLimit((l) => Math.min(l + PAGE, items.length));
        }
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [items.length]);

  const visible = useMemo(() => items.slice(0, limit), [items, limit]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-20 text-center">
        <p className="font-display text-2xl tracking-wide text-cream">Nothing matches</p>
        <p className="max-w-xs text-sm text-muted">
          Loosen a filter or clear your search to see more exercises.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((ex) => (
          <ExerciseCard
            key={ex.id}
            ex={ex}
            inSession={sessionIds.has(ex.id)}
            isFavorite={favoriteIds.has(ex.id)}
            onOpen={() => onOpen(ex)}
            onToggleSession={() => onToggleSession(ex.id)}
            onToggleFavorite={() => onToggleFavorite(ex.id)}
          />
        ))}
      </div>
      {limit < items.length && <div ref={sentinel} className="h-10" />}
    </>
  );
}
