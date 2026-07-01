import { Search, X } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search 1,324 exercises…"
        className="w-full rounded-xl border border-line bg-navy/60 py-3 pl-10 pr-10 text-sm text-cream placeholder:text-muted focus:border-gold/60 focus:outline-none"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-cream"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
