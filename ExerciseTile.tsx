import { Dumbbell } from "lucide-react";

/** Body-part accent hues, kept desaturated so tiles read as one family against
 *  the navy base rather than a rainbow. */
const HUES: Record<string, number> = {
  chest: 352,
  back: 175,
  "upper arms": 28,
  "lower arms": 36,
  shoulders: 265,
  "upper legs": 212,
  "lower legs": 190,
  waist: 145,
  cardio: 330,
  neck: 222,
};

function hueFor(bodyPart: string): number {
  if (HUES[bodyPart] != null) return HUES[bodyPart];
  // Deterministic fallback for any unmapped value.
  let h = 0;
  for (let i = 0; i < bodyPart.length; i++) h = (h * 31 + bodyPart.charCodeAt(i)) % 360;
  return h;
}

interface Props {
  bodyPart: string;
  target: string;
  className?: string;
  big?: boolean;
}

/** A generated, deterministic visual for an exercise — its target muscle set in
 *  gym-signage type over a body-part-tinted panel. Replaces external media. */
export default function ExerciseTile({ bodyPart, target, className = "", big = false }: Props) {
  const hue = hueFor(bodyPart);
  const label = target.replace(/cardiovascular system/i, "cardio");
  const long = label.length > 9;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-navy ${className}`}
      role="img"
      aria-label={`${target}, ${bodyPart}`}
      style={{
        backgroundImage: `radial-gradient(120% 90% at 50% 0%, hsl(${hue} 45% 32% / 0.55), transparent 62%), linear-gradient(160deg, hsl(${hue} 40% 20% / 0.35), #132040)`,
      }}
    >
      <span
        className={`px-3 text-center font-display uppercase leading-[0.9] tracking-tight text-cream/95 ${
          big ? (long ? "text-4xl" : "text-6xl") : long ? "text-lg" : "text-2xl"
        }`}
      >
        {label}
      </span>

      <span
        className={`absolute left-2 top-2 font-display uppercase tracking-[0.15em] text-cream/45 ${
          big ? "text-xs" : "text-[9px]"
        }`}
      >
        {bodyPart}
      </span>

      <Dumbbell
        className={`absolute text-cream/25 ${big ? "bottom-3 right-3 h-6 w-6" : "bottom-2 right-2 h-3.5 w-3.5"}`}
        strokeWidth={1.75}
      />
    </div>
  );
}
