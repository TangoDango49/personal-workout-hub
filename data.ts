import type { Exercise, Filters } from "../types";

/** The GIF CDN for the original ExerciseDB media. Media is not bundled with the
 *  dataset (conflicting ownership claims); these load only if you're entitled to
 *  use them, and the UI falls back gracefully when an asset is missing. */
export function mediaUrl(mediaId: string | null): string | null {
  if (!mediaId) return null;
  return `https://static.exercisedb.dev/media/${mediaId}.gif`;
}

let cache: Exercise[] | null = null;

export async function loadExercises(): Promise<Exercise[]> {
  if (cache) return cache;
  const res = await fetch(`${import.meta.env.BASE_URL}data/exercises.json`);
  if (!res.ok) throw new Error(`Could not load exercises (${res.status})`);
  cache = (await res.json()) as Exercise[];
  return cache;
}

/** Unique, count-sorted values for a facet. */
export function facetValues(
  all: Exercise[],
  key: "bodyPart" | "equipment" | "target",
): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const ex of all) {
    const v = ex[key];
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export function applyFilters(
  all: Exercise[],
  f: Filters,
  favoriteIds: Set<string>,
): Exercise[] {
  const q = f.search.trim().toLowerCase();
  return all.filter((ex) => {
    if (f.favoritesOnly && !favoriteIds.has(ex.id)) return false;
    if (f.bodyPart && ex.bodyPart !== f.bodyPart) return false;
    if (f.equipment && ex.equipment !== f.equipment) return false;
    if (f.target && ex.target !== f.target) return false;
    if (q) {
      const hay = `${ex.name} ${ex.target} ${ex.bodyPart} ${ex.equipment}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Group a list of exercises (or log entries) by body part, preserving the
 *  order in which each body part first appears. */
export function groupByBodyPart<T extends { bodyPart: string }>(
  items: T[],
): { bodyPart: string; items: T[] }[] {
  const order: string[] = [];
  const map = new Map<string, T[]>();
  for (const it of items) {
    if (!map.has(it.bodyPart)) {
      map.set(it.bodyPart, []);
      order.push(it.bodyPart);
    }
    map.get(it.bodyPart)!.push(it);
  }
  return order.map((bodyPart) => ({ bodyPart, items: map.get(bodyPart)! }));
}

const TITLE_OVERRIDES: Record<string, string> = {
  ez: "EZ",
  v: "V",
  iii: "III",
  ii: "II",
};

/** Exercise names arrive lower-cased; present them in Title Case. */
export function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => {
      const lower = w.toLowerCase();
      if (TITLE_OVERRIDES[lower]) return TITLE_OVERRIDES[lower];
      if (w.includes("/")) {
        return w
          .split("/")
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join("/");
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}
