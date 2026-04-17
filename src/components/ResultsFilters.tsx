import { Bus as BusIcon, SlidersHorizontal } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

export type DepartureWindow = "morning" | "afternoon" | "evening" | "night";

export interface Filters {
  busTypes: string[]; // matches substrings: "AC", "Non", "Sleeper", "Seater"
  maxPrice: number;
  windows: DepartureWindow[];
}

interface Props {
  value: Filters;
  onChange: (next: Filters) => void;
  priceCap: number;
  busTypeOptions: { key: string; label: string }[];
}

const WINDOWS: { key: DepartureWindow; label: string; range: string }[] = [
  { key: "morning", label: "Morning", range: "06–12" },
  { key: "afternoon", label: "Afternoon", range: "12–18" },
  { key: "evening", label: "Evening", range: "18–23" },
  { key: "night", label: "Night", range: "23–06" },
];

const ResultsFilters = ({ value, onChange, priceCap, busTypeOptions }: Props) => {
  const toggle = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  return (
    <aside className="bg-card border rounded-xl p-5 space-y-6 sticky top-4">
      <h2 className="flex items-center gap-2 font-bold text-base">
        <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
      </h2>

      {/* Bus Type */}
      <div>
        <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
          <BusIcon className="w-4 h-4" /> Bus Type
        </Label>
        <div className="space-y-2">
          {busTypeOptions.map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={value.busTypes.includes(opt.key)}
                onCheckedChange={() => onChange({ ...value, busTypes: toggle(value.busTypes, opt.key) })}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">
          Max Price: <span className="text-primary font-bold">₹{value.maxPrice.toLocaleString("en-IN")}</span>
        </Label>
        <Slider
          min={200}
          max={priceCap}
          step={50}
          value={[value.maxPrice]}
          onValueChange={([v]) => onChange({ ...value, maxPrice: v })}
        />
      </div>

      {/* Departure window */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Departure Time</Label>
        <div className="grid grid-cols-2 gap-2">
          {WINDOWS.map((w) => {
            const active = value.windows.includes(w.key);
            return (
              <button
                key={w.key}
                type="button"
                onClick={() => onChange({ ...value, windows: toggle(value.windows, w.key) })}
                className={`text-xs rounded-lg border px-2 py-2 transition-smooth ${
                  active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary"
                }`}
              >
                <div className="font-semibold">{w.label}</div>
                <div className="opacity-80">{w.range}</div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange({ busTypes: [], maxPrice: priceCap, windows: [] })
        }
        className="w-full text-sm text-primary font-semibold hover:underline"
      >
        Clear all filters
      </button>
    </aside>
  );
};

export default ResultsFilters;
