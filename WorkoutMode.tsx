import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  Plus,
  Check,
  Flag,
  List,
  Focus,
} from "lucide-react";
import type { Exercise, LoggedSet, Unit } from "../types";
import { groupByBodyPart, titleCase } from "../lib/data";
import ExerciseTile from "./ExerciseTile";

interface Props {
  exercises: Exercise[];
  unit: Unit;
  setsFor: (id: string) => LoggedSet[];
  updateSets: (id: string, sets: LoggedSet[]) => void;
  isMarkedDone: (id: string) => boolean;
  toggleDone: (id: string) => void;
  isComplete: (id: string) => boolean;
  onToggleUnit: () => void;
  onClose: () => void;
  onRemove: (id: string) => void;
  onFinish: () => void;
}

export default function WorkoutMode(props: Props) {
  const {
    exercises,
    unit,
    setsFor,
    updateSets,
    isMarkedDone,
    toggleDone,
    isComplete,
    onToggleUnit,
    onClose,
    onRemove,
    onFinish,
  } = props;

  const [i, setI] = useState(0);
  const [showSteps, setShowSteps] = useState(false);
  const [mode, setMode] = useState<"focus" | "list">("focus");

  if (exercises.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-ink p-8 text-center">
        <p className="font-display text-2xl tracking-wide text-cream">Nothing planned</p>
        <p className="max-w-xs text-sm text-muted">
          Add a few exercises to your plan, then start the workout to log or check them off.
        </p>
        <button
          onClick={onClose}
          className="rounded-xl bg-gold px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink"
        >
          Back to library
        </button>
      </div>
    );
  }

  const completed = exercises.filter((e) => isComplete(e.id)).length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink pt-safe">
      {/* Shared header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onClose}
          aria-label="Exit workout"
          className="grid h-10 w-10 place-items-center rounded-full bg-navy text-cream active:scale-90"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="font-display text-lg tracking-wide text-cream">
          {mode === "list" ? completed : Math.min(i, exercises.length - 1) + 1}
          <span className="text-muted"> / {exercises.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode((m) => (m === "focus" ? "list" : "focus"))}
            aria-label={mode === "focus" ? "Switch to checklist" : "Switch to focus mode"}
            className="grid h-10 w-10 place-items-center rounded-full bg-navy text-cream active:scale-90"
          >
            {mode === "focus" ? <List className="h-5 w-5" /> : <Focus className="h-5 w-5" />}
          </button>
          <button
            onClick={onToggleUnit}
            className="grid h-10 min-w-10 place-items-center rounded-full bg-navy px-3 font-display text-sm uppercase tracking-widest text-gold active:scale-90"
            aria-label={`Weight unit: ${unit}. Tap to switch.`}
          >
            {unit}
          </button>
        </div>
      </div>

      {mode === "list" ? (
        <ChecklistBody
          exercises={exercises}
          setsFor={setsFor}
          isComplete={isComplete}
          toggleDone={toggleDone}
          onOpen={(idx) => {
            setI(idx);
            setShowSteps(false);
            setMode("focus");
          }}
          onFinish={onFinish}
        />
      ) : (
        <FocusBody
          exercises={exercises}
          i={i}
          setI={setI}
          unit={unit}
          setsFor={setsFor}
          updateSets={updateSets}
          isMarkedDone={isMarkedDone}
          toggleDone={toggleDone}
          isComplete={isComplete}
          showSteps={showSteps}
          setShowSteps={setShowSteps}
          onRemove={onRemove}
          onFinish={onFinish}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Checklist mode — a flat, grouped list to tick exercises off fast.   */
/* ------------------------------------------------------------------ */

function ChecklistBody({
  exercises,
  setsFor,
  isComplete,
  toggleDone,
  onOpen,
  onFinish,
}: {
  exercises: Exercise[];
  setsFor: (id: string) => LoggedSet[];
  isComplete: (id: string) => boolean;
  toggleDone: (id: string) => void;
  onOpen: (index: number) => void;
  onFinish: () => void;
}) {
  const index = new Map(exercises.map((e, idx) => [e.id, idx]));
  const groups = groupByBodyPart(exercises);

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.bodyPart}>
              <div className="mb-2 font-display text-[11px] uppercase tracking-[0.2em] text-gold">
                {g.bodyPart}
              </div>
              <div className="space-y-2">
                {g.items.map((e) => {
                  const done = isComplete(e.id);
                  const setCount = setsFor(e.id).length;
                  return (
                    <div
                      key={e.id}
                      className={`flex items-center gap-3 rounded-xl border p-2 transition ${
                        done ? "border-gold/40 bg-gold/10" : "border-line bg-navy/50"
                      }`}
                    >
                      <button
                        onClick={() => onOpen(index.get(e.id) ?? 0)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <ExerciseTile
                          bodyPart={e.bodyPart}
                          target={e.target}
                          className="h-12 w-12 shrink-0 rounded-lg border border-line"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-cream">
                            {titleCase(e.name)}
                          </div>
                          <div className="truncate text-xs text-muted">
                            {e.target} · {e.equipment}
                            {setCount > 0 && (
                              <span className="text-gold"> · {setCount} sets</span>
                            )}
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => toggleDone(e.id)}
                        aria-pressed={done}
                        aria-label={done ? `Mark ${e.name} not done` : `Mark ${e.name} done`}
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition active:scale-90 ${
                          done ? "bg-gold text-ink" : "border border-line text-muted"
                        }`}
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line bg-ink p-4 pb-safe">
        <button
          onClick={onFinish}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold text-sm font-bold uppercase tracking-wide text-ink active:scale-[.99]"
        >
          <Flag className="h-4 w-4" /> Finish &amp; save
        </button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Focus mode — one exercise at a time with the full set logger.       */
/* ------------------------------------------------------------------ */

function FocusBody({
  exercises,
  i,
  setI,
  unit,
  setsFor,
  updateSets,
  isMarkedDone,
  toggleDone,
  isComplete,
  showSteps,
  setShowSteps,
  onRemove,
  onFinish,
}: {
  exercises: Exercise[];
  i: number;
  setI: (fn: (p: number) => number) => void;
  unit: Unit;
  setsFor: (id: string) => LoggedSet[];
  updateSets: (id: string, sets: LoggedSet[]) => void;
  isMarkedDone: (id: string) => boolean;
  toggleDone: (id: string) => void;
  isComplete: (id: string) => boolean;
  showSteps: boolean;
  setShowSteps: (fn: (v: boolean) => boolean) => void;
  onRemove: (id: string) => void;
  onFinish: () => void;
}) {
  const clamped = Math.min(i, exercises.length - 1);
  const ex = exercises[clamped];
  const sets = setsFor(ex.id);
  const atEnd = clamped >= exercises.length - 1;
  const marked = isMarkedDone(ex.id);

  const go = (dir: 1 | -1) => {
    setShowSteps(() => false);
    setI((p) => Math.max(0, Math.min(exercises.length - 1, p + dir)));
  };

  const addSet = () => {
    const last = sets[sets.length - 1];
    updateSets(ex.id, [...sets, { weight: last?.weight ?? 0, reps: last?.reps ?? 10, done: false }]);
  };

  const patchSet = (idx: number, patch: Partial<LoggedSet>) =>
    updateSets(ex.id, sets.map((s, k) => (k === idx ? { ...s, ...patch } : s)));

  const removeSet = (idx: number) =>
    updateSets(ex.id, sets.filter((_, k) => k !== idx));

  return (
    <>
      {/* Progress dots */}
      <div className="flex gap-1 px-4">
        {exercises.map((e, idx) => (
          <div
            key={e.id}
            className={`h-1 flex-1 rounded-full ${
              isComplete(e.id) ? "bg-gold" : idx === clamped ? "bg-cream/60" : "bg-line"
            }`}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <div className="flex items-start gap-3">
          <ExerciseTile
            bodyPart={ex.bodyPart}
            target={ex.target}
            className="h-24 w-24 shrink-0 rounded-xl border border-line"
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl leading-none tracking-wide text-cream">
              {titleCase(ex.name)}
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
                {ex.target}
              </span>
              <span className="rounded-full bg-navy2 px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted">
                {ex.equipment}
              </span>
            </div>
            <button
              onClick={() => onRemove(ex.id)}
              className="mt-2 inline-flex items-center gap-1 text-xs text-muted hover:text-cream"
            >
              <Trash2 className="h-3 w-3" /> Remove from plan
            </button>
          </div>
        </div>

        {/* Lightweight completion */}
        <button
          onClick={() => toggleDone(ex.id)}
          aria-pressed={marked}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold uppercase tracking-wide transition active:scale-[.99] ${
            marked ? "border-gold bg-gold text-ink" : "border-line bg-navy/50 text-cream hover:border-gold/50"
          }`}
        >
          <Check className="h-4 w-4" /> {marked ? "Marked done" : "Mark done"}
        </button>

        {/* Set logger */}
        <div className="mt-4">
          <div className="mb-2 px-1 font-display text-[11px] uppercase tracking-[0.18em] text-muted">
            Log sets <span className="text-muted/60">(optional)</span>
          </div>
          <div className="mb-2 grid grid-cols-[2rem_1fr_1fr_2.5rem] items-center gap-2 px-1 font-display text-[11px] uppercase tracking-[0.18em] text-muted">
            <span>Set</span>
            <span>Weight ({unit})</span>
            <span>Reps</span>
            <span className="text-right">Done</span>
          </div>

          <div className="space-y-2">
            {sets.map((s, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-[2rem_1fr_1fr_2.5rem] items-center gap-2 rounded-xl border p-2 transition ${
                  s.done ? "border-gold/40 bg-gold/10" : "border-line bg-navy/50"
                }`}
              >
                <span className="text-center font-display text-lg text-cream">{idx + 1}</span>
                <NumberField
                  value={s.weight}
                  step={5}
                  onChange={(v) => patchSet(idx, { weight: v })}
                  ariaLabel={`Set ${idx + 1} weight`}
                />
                <NumberField
                  value={s.reps}
                  step={1}
                  onChange={(v) => patchSet(idx, { reps: v })}
                  ariaLabel={`Set ${idx + 1} reps`}
                />
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => patchSet(idx, { done: !s.done })}
                    aria-pressed={s.done}
                    aria-label={s.done ? "Mark set not done" : "Mark set done"}
                    className={`grid h-8 w-8 place-items-center rounded-lg transition active:scale-90 ${
                      s.done ? "bg-gold text-ink" : "border border-line text-muted"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 flex gap-2">
            <button
              onClick={addSet}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line bg-navy2 py-2.5 text-xs font-semibold uppercase tracking-wide text-cream active:scale-[.98]"
            >
              <Plus className="h-3.5 w-3.5" /> Add set
            </button>
            {sets.length > 0 && (
              <button
                onClick={() => removeSet(sets.length - 1)}
                className="rounded-xl border border-line px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted active:scale-[.98]"
              >
                Undo set
              </button>
            )}
          </div>
        </div>

        {/* Collapsible instructions */}
        {ex.steps.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowSteps((v) => !v)}
              className="font-display text-sm uppercase tracking-[0.2em] text-gold"
            >
              {showSteps ? "Hide how-to" : "Show how-to"}
            </button>
            {showSteps && (
              <ol className="mt-3 space-y-2.5">
                {ex.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 font-display text-sm text-gold">
                      {idx + 1}
                    </span>
                    <p className="text-[15px] leading-relaxed text-cream/90">{step}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-line bg-ink p-4 pb-safe">
        <button
          onClick={() => go(-1)}
          disabled={clamped === 0}
          aria-label="Previous exercise"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-line text-cream disabled:opacity-30 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {atEnd ? (
          <button
            onClick={onFinish}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gold text-sm font-bold uppercase tracking-wide text-ink active:scale-[.99]"
          >
            <Flag className="h-4 w-4" /> Finish &amp; save
          </button>
        ) : (
          <button
            onClick={() => go(1)}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-navy2 text-sm font-bold uppercase tracking-wide text-cream active:scale-[.99]"
          >
            Next exercise <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </>
  );
}

/** A number input with big tap targets and a mobile numeric keypad. */
function NumberField({
  value,
  step,
  onChange,
  ariaLabel,
}: {
  value: number;
  step: number;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-line bg-ink">
      <button
        onClick={() => onChange(Math.max(0, +(value - step).toFixed(2)))}
        aria-label="Decrease"
        className="grid h-9 w-8 place-items-center text-muted active:bg-navy2"
      >
        –
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        aria-label={ariaLabel}
        className="w-full min-w-0 bg-transparent py-1.5 text-center text-base font-semibold text-cream focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        onClick={() => onChange(+(value + step).toFixed(2))}
        aria-label="Increase"
        className="grid h-9 w-8 place-items-center text-muted active:bg-navy2"
      >
        +
      </button>
    </div>
  );
}
