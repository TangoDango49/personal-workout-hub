# REP — Plan & Log Workouts

A mobile-first workout app. Browse 1,324 exercises, build a plan, then **log every set** (weight × reps) as you train. Finished workouts save to a history you can review and repeat.

Stack: **Vite + React + TypeScript + Tailwind** — the same stack Lovable uses, so it imports cleanly and you can keep refining it by prompt.

## What it does

- **Browse & search** 1,324 exercises, filter by body part, equipment, or target muscle.
- **Plan** — tap Add to drop exercises into today's plan (survives reloads).
- **Log** — Start the workout and record sets per exercise: weight, reps, and a done tick. Sets prefill from your last set for speed. lb/kg toggle.
- **Two ways to run a workout** — toggle in the workout header:
  - *Focus* steps through one exercise at a time with the full set logger.
  - *Checklist* shows every planned exercise grouped by body part so you can tick them off fast; tap any row to jump into it and log sets.
- **Or just check it done** — Mark done completes an exercise without logging any sets (good for bodyweight, cardio, or a quick log).
- **Grouping** — toggle the library into collapsible body-part sections, and the workout runs one muscle group at a time.
- **Resume** — exit mid-workout and your progress is still there; the tray says Resume.
- **History** — Finish & save writes the session to history with the date, set count, and total volume, grouped by body part. Expand any past workout to review it, delete it, or Repeat it to reload those exercises into a new plan.
- **Favorites** — star exercises and filter to just them.

Everything is stored locally in your browser (`localStorage`). No backend, no account.

## Exercise visuals

The original dataset ships **no media** — there are conflicting ownership claims over the ExerciseDB GIFs, so they're not redistributed and this app doesn't use them. Instead each exercise shows a generated tile: its target muscle in gym-signage type over a panel tinted by body part. No network calls, no broken images, nothing to license. If you ever want real demo media, add an `<img>` in `ExerciseTile.tsx` pointing at a source you control.

## Get it live (easy path: Lovable)

1. Push this folder to a GitHub repo (see below), or upload the project directly in Lovable.
2. In Lovable, create a project from the repo. It recognizes the Vite/React/Tailwind setup.
3. Hit **Publish** for an instant live URL you can open on your phone and Add to Home Screen.

From there you can keep building by prompting — "add a rest timer between sets," "show a weekly volume chart," "let me name each workout." Just don't let a regeneration move or overwrite `public/data/exercises.json` — it's fetched at runtime.

### Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

### Push to GitHub

```bash
git init && git add . && git commit -m "REP workout app"
git branch -M main
git remote add origin https://github.com/<you>/rep-exercise-app.git
git push -u origin main
```

## Project structure

```
public/data/exercises.json   # 1,324 exercises, English (~0.83 MB, mobile-friendly)
src/
  App.tsx                    # state: data, filters, plan, active workout, logs, history
  types.ts                   # Exercise, Filters, LoggedSet, WorkoutLog
  lib/
    data.ts                  # load, filter, facet counts, media URL, title-case
    store.ts                 # favorites, plan, active workout, logs, unit — all persisted
  components/
    SearchBar / FilterBar / ExerciseGrid / ExerciseCard / ExerciseSheet / ExerciseGif
    SessionTray.tsx          # sticky Start/Resume bar
    WorkoutMode.tsx          # the set logger
    HistorySheet.tsx         # past workouts: review, delete, repeat
```


## Data attribution

Exercise data originates from [ExerciseDB v1 by AscendAPI](https://oss.exercisedb.dev). For educational/personal use — check the source's terms before commercial use.
