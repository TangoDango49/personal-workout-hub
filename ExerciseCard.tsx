import { Check, Plus, Star } from "lucide-react";
import type { Exercise } from "../types";
import { titleCase } from "../lib/data";
import ExerciseTile from "./ExerciseTile";

interface Props {
  ex: Exercise;
  inSession: boolean;
  isFavorite: boolean;
  onOpen: () => void;
  onToggleSession: () => void;
  onToggleFavorite: () => void;
}

export default function ExerciseCard({
  ex,
  inSession,
  isFavorite,
  onOpen,
  onToggleSession,
  onToggleFavorite,
}: Props) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-navy/60 shadow-card">
      <button
        onClick={onOpen}
        className="block text-left"
        aria-label={`Open ${titleCase(ex.name)}`}
      >
        <ExerciseTile bodyPart={ex.bodyPart} target={ex.target} className="aspect-square" />
      </button>

      {/* Favorite toggle, top-left over the media */}
      <button
        onClick={onToggleFavorite}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        className="absolute left-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-ink/70 backdrop-blur transition active:scale-90"
      >
        <Star
          className={`h-4 w-4 ${isFavorite ? "fill-gold text-gold" : "text-cream/70"}`}
        />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <button onClick={onOpen} className="text-left">
          <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-cream">
            {titleCase(ex.name)}
          </h3>
        </button>

        <div className="mt-auto flex flex-wrap items-center gap-1">
          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
            {ex.target}
          </span>
          <span className="rounded-full bg-navy2 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
            {ex.equipment}
          </span>
        </div>

        <button
          onClick={onToggleSession}
          aria-pressed={inSession}
          className={`mt-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold uppercase tracking-wide transition active:scale-[.98] ${
            inSession
              ? "bg-gold text-ink"
              : "border border-line bg-navy2 text-cream hover:border-gold/50"
          }`}
        >
          {inSession ? (
            <>
              <Check className="h-3.5 w-3.5" /> In session
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" /> Add
            </>
          )}
        </button>
      </div>
    </div>
  );
}
