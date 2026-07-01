import { useEffect, useMemo, useState } from "react";
import { History, LayoutGrid, Layers } from "lucide-react";
import type { Exercise, Filters, WorkoutLog } from "./types";
import { EMPTY_FILTERS } from "./types";
import { applyFilters, groupByBodyPart, loadExercises } from "./lib/data";
import {
  useActiveWorkout,
  useFavorites,
  useLogs,
  useSession,
  useUnit,
} from "./lib/store";
import SearchBar from "./components/SearchBar";
import FilterBar from "./components/FilterBar";
import ExerciseGrid from "./components/ExerciseGrid";
import GroupedView from "./components/GroupedView";
import ExerciseSheet from "./components/ExerciseSheet";
import SessionTray from "./components/SessionTray";
import WorkoutMode from "./components/WorkoutMode";
import HistorySheet from "./components/HistorySheet";

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `w_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export default function App() {
  const [all, setAll] = useState<Exercise[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [active, setActive] = useState<Exercise | null>(null);
  const [running, setRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [grouped, setGrouped] = useState(false);

  const favorites = useFavorites();
  const session = useSession();
  const workout = useActiveWorkout();
  const logs = useLogs();
  const { unit, toggle: toggleUnit } = useUnit();

  useEffect(() => {
    loadExercises()
      .then((data) => {
        setAll(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const favoriteIds = useMemo(() => new Set(favorites.ids), [favorites.ids]);
  const sessionIds = useMemo(() => new Set(session.ids), [session.ids]);

  const results = useMemo(
    () => applyFilters(all, filters, favoriteIds),
    [all, filters, favoriteIds],
  );

  const sessionExercises = useMemo(() => {
    const byId = new Map(all.map((e) => [e.id, e]));
    return session.ids.map((id) => byId.get(id)).filter((e): e is Exercise => Boolean(e));
  }, [all, session.ids]);

  // The workout runs grouped by body part so you move through one muscle group
  // at a time rather than jumping around in add-order.
  const orderedSession = useMemo(
    () => groupByBodyPart(sessionExercises).flatMap((g) => g.items),
    [sessionExercises],
  );

  const patch = (p: Partial<Filters>) => setFilters((f) => ({ ...f, ...p }));

  const finishWorkout = () => {
    const entries = orderedSession
      .filter((ex) => workout.isComplete(ex.id))
      .map((ex) => ({
        exerciseId: ex.id,
        name: ex.name,
        bodyPart: ex.bodyPart,
        sets: workout.setsFor(ex.id),
      }));

    if (entries.length > 0) {
      const log: WorkoutLog = { id: newId(), date: new Date().toISOString(), unit, entries };
      logs.add(log);
    }

    workout.clear();
    session.clear();
    setRunning(false);
    if (entries.length > 0) setShowHistory(true);
  };

  const repeatWorkout = (exerciseIds: string[]) => {
    session.clear();
    exerciseIds.forEach((id) => session.add(id));
    workout.clear();
    setShowHistory(false);
  };

  if (status === "error") {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="font-display text-3xl tracking-wide text-cream">Couldn’t load exercises</h1>
        <p className="max-w-xs text-sm text-muted">
          The data file at <code>/data/exercises.json</code> didn’t load. Refresh, or check that the
          file is in the <code>public/data</code> folder.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b border-line bg-ink/90 backdrop-blur pt-safe">
        <div className="mx-auto max-w-3xl px-4 pb-3 pt-3">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="font-display text-3xl leading-none tracking-[0.08em] text-cream">
              REP<span className="text-gold">.</span>
            </h1>
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 rounded-full border border-line bg-navy/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-cream active:scale-95"
            >
              <History className="h-3.5 w-3.5" />
              History{logs.count ? ` · ${logs.count}` : ""}
            </button>
          </div>
          <div className="space-y-2.5">
            <SearchBar value={filters.search} onChange={(v) => patch({ search: v })} />
            {status === "ready" && (
              <FilterBar all={all} filters={filters} favCount={favorites.count} onChange={patch} />
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-32 pt-4">
        {status === "loading" ? (
          <SkeletonGrid />
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-sm uppercase tracking-[0.2em] text-muted">
                {results.length} {results.length === 1 ? "exercise" : "exercises"}
              </p>
              <button
                onClick={() => setGrouped((g) => !g)}
                className="flex items-center gap-1.5 rounded-full border border-line bg-navy/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-cream active:scale-95"
              >
                {grouped ? <LayoutGrid className="h-3.5 w-3.5" /> : <Layers className="h-3.5 w-3.5" />}
                {grouped ? "All" : "Group"}
              </button>
            </div>
            {grouped ? (
              <GroupedView
                items={results}
                favoriteIds={favoriteIds}
                sessionIds={sessionIds}
                onOpen={setActive}
                onToggleSession={session.toggle}
                onToggleFavorite={favorites.toggle}
              />
            ) : (
              <ExerciseGrid
                items={results}
                favoriteIds={favoriteIds}
                sessionIds={sessionIds}
                onOpen={setActive}
                onToggleSession={session.toggle}
                onToggleFavorite={favorites.toggle}
              />
            )}
          </>
        )}
      </main>

      <SessionTray
        count={session.count}
        resuming={workout.hasAny}
        onStart={() => setRunning(true)}
      />

      {active && (
        <ExerciseSheet
          ex={active}
          inSession={sessionIds.has(active.id)}
          isFavorite={favoriteIds.has(active.id)}
          onClose={() => setActive(null)}
          onToggleSession={() => session.toggle(active.id)}
          onToggleFavorite={() => favorites.toggle(active.id)}
        />
      )}

      {running && (
        <WorkoutMode
          exercises={orderedSession}
          unit={unit}
          setsFor={workout.setsFor}
          updateSets={workout.updateSets}
          isMarkedDone={workout.isMarkedDone}
          toggleDone={workout.toggleDone}
          isComplete={workout.isComplete}
          onToggleUnit={toggleUnit}
          onClose={() => setRunning(false)}
          onRemove={session.remove}
          onFinish={finishWorkout}
        />
      )}

      {showHistory && (
        <HistorySheet
          logs={logs.logs}
          onClose={() => setShowHistory(false)}
          onDelete={logs.remove}
          onRepeat={repeatWorkout}
        />
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[3/4] animate-pulse rounded-2xl border border-line bg-navy/40"
        />
      ))}
    </div>
  );
}
