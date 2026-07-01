import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Exercise } from "../types";
import { groupByBodyPart } from "../lib/data";
import ExerciseCard from "./ExerciseCard";

interface Props {
  items: Exercise[];
  favoriteIds: Set<string>;
  sessionIds: Set<string>;
  onOpen: (ex: Exercise) => void;
  onToggleSession: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function GroupedView({
  items,
  favoriteIds,
  sessionIds,
  onOpen,
  onToggleSession,
  onToggleFavorite,
}: Props) {
  const groups = groupByBodyPart(items);
  // Collapsed by default keeps the DOM light; the first group opens so the
  // screen isn't empty.
  const [open, setOpen] = useState<Set<string>>(new Set());

  useEffect(() => {
    setOpen(new Set(groups[0] ? [groups[0].bodyPart] : []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

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

  const toggle = (bp: string) =>
    setOpen((cur) => {
      const next = new Set(cur);
      next.has(bp) ? next.delete(bp) : next.add(bp);
      return next;
    });

  return (
    <div className="space-y-3">
      {groups.map((g) => {
        const isOpen = open.has(g.bodyPart);
        return (
          <div key={g.bodyPart} className="overflow-hidden rounded-2xl border border-line">
            <button
              onClick={() => toggle(g.bodyPart)}
              className="flex w-full items-center justify-between bg-navy/50 px-4 py-3 text-left"
            >
              <span className="font-display text-xl uppercase tracking-wide text-cream">
                {g.bodyPart}
                <span className="ml-2 text-sm text-muted">{g.items.length}</span>
              </span>
              <ChevronDown
                className={`h-5 w-5 text-muted transition ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-4">
                {g.items.map((ex) => (
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
            )}
          </div>
        );
      })}
    </div>
  );
}
