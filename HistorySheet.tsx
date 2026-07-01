import { useState } from "react";
import { X, Trash2, RotateCcw, ChevronDown } from "lucide-react";
import type { WorkoutLog } from "../types";
import { groupByBodyPart, titleCase } from "../lib/data";

interface Props {
  logs: WorkoutLog[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onRepeat: (exerciseIds: string[]) => void;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function volume(log: WorkoutLog): number {
  return log.entries.reduce(
    (sum, e) => sum + e.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    0,
  );
}

function totalSets(log: WorkoutLog): number {
  return log.entries.reduce((n, e) => n + e.sets.length, 0);
}

export default function HistorySheet({ logs, onClose, onDelete, onRepeat }: Props) {
  const [open, setOpen] = useState<string | null>(logs[0]?.id ?? null);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink pt-safe">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-display text-2xl tracking-wide text-cream">History</h2>
        <button
          onClick={onClose}
          aria-label="Close history"
          className="grid h-10 w-10 place-items-center rounded-full bg-navy text-cream active:scale-90"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-safe">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-24 text-center">
            <p className="font-display text-2xl tracking-wide text-cream">No workouts yet</p>
            <p className="max-w-xs text-sm text-muted">
              Finish a workout and it lands here — every set, every session.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const isOpen = open === log.id;
              return (
                <div key={log.id} className="overflow-hidden rounded-2xl border border-line bg-navy/50">
                  <button
                    onClick={() => setOpen(isOpen ? null : log.id)}
                    className="flex w-full items-center justify-between gap-3 p-4 text-left"
                  >
                    <div>
                      <div className="font-display text-xl tracking-wide text-cream">
                        {fmtDate(log.date)}
                      </div>
                      <div className="mt-0.5 text-xs uppercase tracking-wide text-muted">
                        {log.entries.length} exercises · {totalSets(log)} sets ·{" "}
                        {volume(log).toLocaleString()} {log.unit} volume
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-muted transition ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-line px-4 pb-4 pt-3">
                      <div className="space-y-4">
                        {groupByBodyPart(log.entries).map((g) => (
                          <div key={g.bodyPart}>
                            <div className="mb-1.5 font-display text-[11px] uppercase tracking-[0.18em] text-gold">
                              {g.bodyPart}
                            </div>
                            <div className="space-y-2.5">
                              {g.items.map((e) => (
                                <div key={e.exerciseId}>
                                  <div className="text-sm font-semibold text-cream">
                                    {titleCase(e.name)}
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-1.5">
                                    {e.sets.map((s, idx) => (
                                      <span
                                        key={idx}
                                        className={`rounded-md px-2 py-0.5 text-xs ${
                                          s.done ? "bg-gold/15 text-gold" : "bg-navy2 text-muted"
                                        }`}
                                      >
                                        {s.weight}
                                        {log.unit} × {s.reps}
                                      </span>
                                    ))}
                                    {e.sets.length === 0 && (
                                      <span className="inline-flex items-center gap-1 rounded-md bg-gold/15 px-2 py-0.5 text-xs text-gold">
                                        Done
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => onRepeat(log.entries.map((e) => e.exerciseId))}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gold py-2.5 text-xs font-bold uppercase tracking-wide text-ink active:scale-[.98]"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Repeat workout
                        </button>
                        <button
                          onClick={() => onDelete(log.id)}
                          aria-label="Delete this workout"
                          className="grid place-items-center rounded-xl border border-line px-4 text-muted active:scale-[.98]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
