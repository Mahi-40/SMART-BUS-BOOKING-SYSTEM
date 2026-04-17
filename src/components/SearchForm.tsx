import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightLeft, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CityAutocomplete from "@/components/CityAutocomplete";

const SearchForm = () => {
  const navigate = useNavigate();
  const [source, setSource] = useState("Hyderabad");
  const [destination, setDestination] = useState("Warangal");
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });

  const swap = () => {
    setSource(destination);
    setDestination(source);
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !destination.trim() || !date) {
      toast.error("Please fill in all fields");
      return;
    }
    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
      toast.error("Source and destination cannot be the same");
      return;
    }
    const params = new URLSearchParams({ source: source.trim(), destination: destination.trim(), date });
    navigate(`/results?${params.toString()}`);
  };

  return (
    <form
      onSubmit={onSearch}
      className="relative bg-card text-card-foreground rounded-2xl shadow-lg ring-1 ring-border/50 p-4 md:p-6 flex flex-col lg:flex-row gap-3 items-stretch animate-slide-up"
    >
      {/* From */}
      <CityAutocomplete
        id="from-input"
        label="From"
        value={source}
        onChange={setSource}
        placeholder="Leaving from"
        excludeCity={destination}
      />

      <button
        type="button"
        onClick={swap}
        aria-label="Swap source and destination"
        className="self-center bg-secondary hover:bg-primary hover:text-primary-foreground hover:scale-110 rounded-full p-2 transition-base border shadow-sm"
      >
        <ArrowRightLeft className="w-4 h-4" />
      </button>

      {/* To */}
      <CityAutocomplete
        id="to-input"
        label="To"
        value={destination}
        onChange={setDestination}
        placeholder="Going to"
        excludeCity={source}
      />

      {/* Date */}
      <div className="flex-1 lg:max-w-[200px] relative rounded-xl px-3 py-2 hover:bg-secondary/60 transition-base border-l-0 lg:border-l">
        <label htmlFor="date-input" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Date of Journey
        </label>
        <input
          id="date-input"
          name="date"
          type="date"
          value={date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDate(e.target.value)}
          className="w-full text-lg font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 mt-1 text-foreground"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="bg-primary hover:bg-primary-dark hover:scale-[1.02] text-primary-foreground font-bold text-base px-8 lg:px-10 rounded-xl shadow-primary transition-base"
      >
        <Search className="w-4 h-4 mr-1" /> Search Buses
      </Button>
    </form>
  );
};

export default SearchForm;
