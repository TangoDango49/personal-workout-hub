import { useState } from "react";
import { SlidersHorizontal, Star, X } from "lucide-react";
import type { Exercise, Filters } from "../types";
import { facetValues } from "../lib/data";

interface Props {
  all: Exercise[];
  filters: Filters;
  favCount: number;
  onChange: (patch: Partial<Filters>) => void;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition active:scale-95 ${
        active
          ? "bg-gold text-ink"
          : "border border-line bg-navy/60 text-muted hover:text-cream"
      }`}
    >
      {children}
    </button>
  );
}

export default function FilterBar({ all, filters, favCount, onChange }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const bodyParts = facetValues(all, "bodyPart");
  const equipment = facetValues(all, "equipment");
  const targets = facetValues(all, "target");

  const activeExtra = (filters.equipment ? 1 : 0) + (filters.target ? 1 : 0);

  return (
    <div className="space-y-2">
      {/* Primary rail: body part + favorites + filter button */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-0.5">
        <button
          onClick={() => setSheetOpen(true)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition active:scale-95 ${
            activeExtra
              ? "border-gold/60 bg-gold/15 text-gold"
              : "border-line bg-navy/60 text-cream"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters{activeExtra ? ` · ${activeExtra}` : ""}
        </button>

        <button
          onClick={() => onChange({ favoritesOnly: !filters.favoritesOnly })}
          aria-pressed={filters.favoritesOnly}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition active:scale-95 ${
            filters.favoritesOnly
              ? "bg-gold text-ink"
              : "border border-line bg-navy/60 text-muted hover:text-cream"
          }`}
        >
          <Star
            className={`h-3.5 w-3.5 ${filters.favoritesOnly ? "fill-ink" : ""}`}
          />
          Saved{favCount ? ` · ${favCount}` : ""}
        </button>

        <div className="h-5 w-px shrink-0 bg-line" />

        <Chip active={!filters.bodyPart} onClick={() => onChange({ bodyPart: null })}>
          All
        </Chip>
        {bodyParts.map((b) => (
          <Chip
            key={b.value}
            active={filters.bodyPart === b.value}
            onClick={() =>
              onChange({ bodyPart: filters.bodyPart === b.value ? null : b.value })
            }
          >
            {b.value}
          </Chip>
        ))}
      </div>

      {/* Full filter sheet */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end bg-ink/70 animate-fade"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full overflow-y-auto rounded-t-3xl border-t border-line bg-ink p-5 pb-safe animate-sheetUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl tracking-wide text-cream">Filters</h2>
              <button
                onClick={() => setSheetOpen(false)}
                aria-label="Close filters"
                className="grid h-9 w-9 place-items-center rounded-full bg-navy text-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <Group label="Equipment">
              <Chip active={!filters.equipment} onClick={() => onChange({ equipment: null })}>
                Any
              </Chip>
              {equipment.map((e) => (
                <Chip
                  key={e.value}
                  active={filters.equipment === e.value}
                  onClick={() =>
                    onChange({
                      equipment: filters.equipment === e.value ? null : e.value,
                    })
                  }
                >
                  {e.value} <span className="opacity-60">{e.count}</span>
                </Chip>
              ))}
            </Group>

            <Group label="Target muscle">
              <Chip active={!filters.target} onClick={() => onChange({ target: null })}>
                Any
              </Chip>
              {targets.map((t) => (
                <Chip
                  key={t.value}
                  active={filters.target === t.value}
                  onClick={() =>
                    onChange({ target: filters.target === t.value ? null : t.value })
                  }
                >
                  {t.value} <span className="opacity-60">{t.count}</span>
                </Chip>
              ))}
            </Group>

            <div className="sticky bottom-0 -mx-5 mt-2 flex gap-3 border-t border-line bg-ink px-5 pt-4">
              <button
                onClick={() => onChange({ equipment: null, target: null })}
                className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold uppercase tracking-wide text-muted"
              >
                Reset
              </button>
              <button
                onClick={() => setSheetOpen(false)}
                className="flex-1 rounded-xl bg-gold py-3 text-sm font-semibold uppercase tracking-wide text-ink"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2.5 font-display text-sm uppercase tracking-[0.2em] text-muted">
        {label}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
