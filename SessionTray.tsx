import { Play, Dumbbell } from "lucide-react";

interface Props {
  count: number;
  resuming: boolean;
  onStart: () => void;
}

export default function SessionTray({ count, resuming, onStart }: Props) {
  if (count === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-safe">
      <div className="pointer-events-auto mx-auto mb-3 flex max-w-md items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-navy2/95 p-2.5 pl-4 shadow-card backdrop-blur">
        <div className="flex items-center gap-2.5">
          <Dumbbell className="h-5 w-5 text-gold" />
          <div className="leading-tight">
            <div className="font-display text-lg leading-none tracking-wide text-cream">
              {count} {count === 1 ? "exercise" : "exercises"}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-muted">
              {resuming ? "Workout in progress" : "Ready to log"}
            </div>
          </div>
        </div>
        <button
          onClick={onStart}
          className="flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-ink transition active:scale-95"
        >
          <Play className="h-4 w-4 fill-ink" /> {resuming ? "Resume" : "Start"}
        </button>
      </div>
    </div>
  );
}
