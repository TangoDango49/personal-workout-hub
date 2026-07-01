import { Check, Plus, Star, X } from "lucide-react";
import type { Exercise } from "../types";
import { titleCase } from "../lib/data";
import ExerciseTile from "./ExerciseTile";

interface Props {
  ex: Exercise;
  inSession: boolean;
  isFavorite: boolean;
  onClose: () => void;
  onToggleSession: () => void;
  onToggleFavorite: () => void;
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-navy/60 px-3 py-2">
      <div className="font-display text-[11px] uppercase tracking-[0.18em] text-muted">
        {label}
      </div>
      <div className="text-sm font-semibold capitalize text-cream">{value}</div>
    </div>
  );
}

export default function ExerciseSheet({
  ex,
  inSession,
  isFavorite,
  onClose,
  onToggleSession,
  onToggleFavorite,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-ink/80 animate-fade"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-line bg-ink animate-sheetUp"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={titleCase(ex.name)}
      >
        {/* Media header */}
        <div className="relative shrink-0">
          <ExerciseTile
            bodyPart={ex.bodyPart}
            target={ex.target}
            big
            className="aspect-[4/3] w-full border-b border-line"
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-ink/70 text-cream backdrop-blur active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-ink/70 backdrop-blur active:scale-90"
          >
            <Star className={`h-5 w-5 ${isFavorite ? "fill-gold text-gold" : "text-cream"}`} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5">
          <h2 className="font-display text-3xl leading-none tracking-wide text-cream">
            {titleCase(ex.name)}
          </h2>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Meta label="Body part" value={ex.bodyPart} />
            <Meta label="Target" value={ex.target} />
            <Meta label="Equipment" value={ex.equipment} />
          </div>

          {ex.secondary.length > 0 && (
            <div className="mt-4">
              <div className="font-display text-[11px] uppercase tracking-[0.18em] text-muted">
                Also works
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {ex.secondary.map((m) => (
                  <span
                    key={m}
                    className="rounded-full bg-navy2 px-2.5 py-1 text-xs capitalize text-cream"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="mb-3 font-display text-sm uppercase tracking-[0.2em] text-gold">
              How to
            </div>
            {ex.steps.length > 0 ? (
              <ol className="space-y-3">
                {ex.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 font-display text-sm text-gold">
                      {i + 1}
                    </span>
                    <p className="text-[15px] leading-relaxed text-cream/90">{step}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">No instructions recorded for this exercise.</p>
            )}
          </div>
        </div>

        {/* Sticky action */}
        <div className="shrink-0 border-t border-line bg-ink p-4 pb-safe">
          <button
            onClick={onToggleSession}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold uppercase tracking-wide transition active:scale-[.99] ${
              inSession ? "bg-navy2 text-cream" : "bg-gold text-ink"
            }`}
          >
            {inSession ? (
              <>
                <Check className="h-4 w-4" /> Remove from session
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add to session
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
