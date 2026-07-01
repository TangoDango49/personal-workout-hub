export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  secondary: string[];
  steps: string[];
  mediaId: string | null;
}

export type Unit = "lb" | "kg";

/** One recorded set: a weight and a rep count, plus whether it's been ticked off. */
export interface LoggedSet {
  weight: number;
  reps: number;
  done: boolean;
}

/** All sets recorded for one exercise, keyed by exercise id while a workout is
 *  in progress. */
export type ActiveSets = Record<string, LoggedSet[]>;

/** A finished, saved workout. */
export interface WorkoutLog {
  id: string;
  date: string; // ISO timestamp
  unit: Unit;
  entries: {
    exerciseId: string;
    name: string;
    bodyPart: string;
    sets: LoggedSet[];
  }[];
}

export type FilterKey = "bodyPart" | "equipment" | "target";

export interface Filters {
  bodyPart: string | null;
  equipment: string | null;
  target: string | null;
  search: string;
  favoritesOnly: boolean;
}

export const EMPTY_FILTERS: Filters = {
  bodyPart: null,
  equipment: null,
  target: null,
  search: "",
  favoritesOnly: false,
};
