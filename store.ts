import { useCallback, useEffect, useState } from "react";
import type { ActiveSets, Unit, WorkoutLog } from "../types";

/** A generic localStorage-backed value hook. Keeps state in memory if storage
 *  is unavailable, and writes through on every change. */
function usePersistedValue<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable */
    }
  }, [key, value]);

  return [value, setValue] as const;
}


/** A tiny persisted-set hook. Survives reloads via localStorage and stays in
 *  sync across hook instances within the tab. */
function usePersistedIds(key: string) {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(ids));
    } catch {
      /* storage full or unavailable — keep state in memory */
    }
  }, [key, ids]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string) => {
    setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }, []);

  const add = useCallback((id: string) => {
    setIds((cur) => (cur.includes(id) ? cur : [...cur, id]));
  }, []);

  const remove = useCallback((id: string) => {
    setIds((cur) => cur.filter((x) => x !== id));
  }, []);

  const clear = useCallback(() => setIds([]), []);

  return { ids, has, toggle, add, remove, clear, count: ids.length };
}

export function useFavorites() {
  return usePersistedIds("rep.favorites.v1");
}

export function useSession() {
  return usePersistedIds("rep.session.v1");
}

/** The user's weight unit preference. */
export function useUnit() {
  const [unit, setUnit] = usePersistedValue<Unit>("rep.unit.v1", "lb");
  const toggle = useCallback(
    () => setUnit((u) => (u === "lb" ? "kg" : "lb")),
    [setUnit],
  );
  return { unit, toggle };
}

/** Sets recorded during the workout currently in progress, plus a per-exercise
 *  "done" flag for lightweight logging (mark it done without recording sets).
 *  Persists so an accidental exit doesn't lose progress. */
export function useActiveWorkout() {
  const [state, setState] = usePersistedValue<{
    sets: ActiveSets;
    done: Record<string, boolean>;
  }>("rep.active.v2", { sets: {}, done: {} });

  const setsFor = useCallback(
    (id: string) => state.sets[id] ?? [],
    [state.sets],
  );

  const updateSets = useCallback(
    (id: string, next: import("../types").LoggedSet[]) =>
      setState((cur) => ({ ...cur, sets: { ...cur.sets, [id]: next } })),
    [setState],
  );

  const isMarkedDone = useCallback(
    (id: string) => state.done[id] === true,
    [state.done],
  );

  const toggleDone = useCallback(
    (id: string) =>
      setState((cur) => ({ ...cur, done: { ...cur.done, [id]: !cur.done[id] } })),
    [setState],
  );

  /** An exercise counts as complete if it's checkmarked OR has any ticked set. */
  const isComplete = useCallback(
    (id: string) =>
      state.done[id] === true || (state.sets[id] ?? []).some((s) => s.done),
    [state.done, state.sets],
  );

  const clear = useCallback(() => setState({ sets: {}, done: {} }), [setState]);

  const hasAny =
    Object.values(state.sets).some((arr) => arr.length > 0) ||
    Object.values(state.done).some(Boolean);

  return { setsFor, updateSets, isMarkedDone, toggleDone, isComplete, clear, hasAny };
}

/** Saved workout history, newest first. */
export function useLogs() {
  const [logs, setLogs] = usePersistedValue<WorkoutLog[]>("rep.logs.v1", []);

  const add = useCallback(
    (log: WorkoutLog) => setLogs((cur) => [log, ...cur]),
    [setLogs],
  );

  const remove = useCallback(
    (id: string) => setLogs((cur) => cur.filter((l) => l.id !== id)),
    [setLogs],
  );

  return { logs, add, remove, count: logs.length };
}
