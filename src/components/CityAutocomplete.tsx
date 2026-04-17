import { useEffect, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const TELANGANA_CITIES = [
  "Hyderabad",
  "Warangal",
  "Karimnagar",
  "Nizamabad",
  "Khammam",
  "Nalgonda",
  "Adilabad",
  "Mahbubnagar",
  "Medak",
  "Siddipet",
  "Suryapet",
  "Jagitial",
  "Mancherial",
];

interface CityAutocompleteProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  excludeCity?: string;
}

const CityAutocomplete = ({
  id,
  label,
  value,
  onChange,
  placeholder = "Select city",
  excludeCity,
}: CityAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        // Reset query if user typed something that isn't a valid selection
        setQuery(value);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [value]);

  const filtered = TELANGANA_CITIES.filter(
    (c) =>
      c.toLowerCase().includes(query.toLowerCase()) &&
      c.toLowerCase() !== (excludeCity ?? "").toLowerCase()
  );

  const select = (city: string) => {
    onChange(city);
    setQuery(city);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlightIdx]) select(filtered[highlightIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="flex-1 relative rounded-xl px-3 py-2 hover:bg-secondary/60 transition-base"
    >
      <label
        htmlFor={id}
        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1"
      >
        <MapPin className="w-3 h-3" /> {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onFocus={() => {
            setOpen(true);
            setHighlightIdx(0);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlightIdx(0);
          }}
          onKeyDown={onKeyDown}
          className="w-full text-lg font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 mt-1 placeholder:text-muted-foreground pr-6 text-foreground"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => {
              setQuery("");
              onChange("");
              setOpen(true);
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 z-[1000] bg-popover text-popover-foreground border rounded-xl shadow-lg max-h-64 overflow-y-auto animate-fade-in">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No cities found
            </div>
          ) : (
            <ul role="listbox" className="py-1 text-foreground">
              {filtered.map((city, idx) => {
                const isSelected = city.toLowerCase() === value.toLowerCase();
                const isHighlighted = idx === highlightIdx;
                return (
                  <li
                    key={city}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightIdx(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      select(city);
                    }}
                    className={cn(
                      "px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2 transition-base",
                      isHighlighted && "bg-secondary",
                      isSelected && "bg-primary/10 text-primary font-semibold"
                    )}
                  >
                    <MapPin className="w-3.5 h-3.5 opacity-60" />
                    {city}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;
