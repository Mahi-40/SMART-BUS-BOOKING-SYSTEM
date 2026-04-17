import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Spinner from "@/components/Spinner";
import BusCard from "@/components/BusCard";
import ResultsFilters, { type Filters } from "@/components/ResultsFilters";
import { busApi } from "@/api/client";
import type { Bus } from "@/types";
import { ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortKey = "price-asc" | "price-desc" | "departure-asc" | "rating-desc";

const BUS_TYPE_OPTIONS = [
  { key: "AC", label: "AC" },
  { key: "Non", label: "Non-AC" },
  { key: "Sleeper", label: "Sleeper" },
  { key: "Seater", label: "Seater" },
  { key: "Luxury", label: "Luxury" },
];

const toMinutes = (t?: string) => {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

const inWindow = (t: string | undefined, w: Filters["windows"][number]) => {
  const m = toMinutes(t);
  if (w === "morning") return m >= 360 && m < 720;
  if (w === "afternoon") return m >= 720 && m < 1080;
  if (w === "evening") return m >= 1080 && m < 1380;
  return m >= 1380 || m < 360; // night
};

const Results = () => {
  const [params] = useSearchParams();
  const source = params.get("source") ?? "";
  const destination = params.get("destination") ?? "";
  const date = params.get("date") ?? new Date().toISOString().split("T")[0];

  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("price-asc");

  const priceCap = useMemo(
    () => Math.max(2000, ...buses.map((b) => b.price ?? 0)),
    [buses]
  );

  const [filters, setFilters] = useState<Filters>({
    busTypes: [],
    maxPrice: 2000,
    windows: [],
  });

  useEffect(() => {
    document.title = `${source} → ${destination} buses | RedRoute`;
  }, [source, destination]);

  useEffect(() => {
    setLoading(true);
    console.log("[Results] fetching buses for", { source, destination, date });
    busApi
      .list(source, destination)
      .then((data) => {
        console.log("[Results] received", data.length, "buses");
        setBuses(data);
      })
      .catch((err) => {
        console.error("[Results] failed to load buses:", err);
        setBuses([]);
      })
      .finally(() => setLoading(false));
  }, [source, destination, date]);

  // Reset price cap once buses load
  useEffect(() => {
    setFilters((f) => ({ ...f, maxPrice: priceCap }));
  }, [priceCap]);

  const filteredSorted = useMemo(() => {
    let list = buses.filter((b) => {
      if (filters.busTypes.length) {
        const t = (b.busType ?? "").toLowerCase();
        const matches = filters.busTypes.some((k) => t.includes(k.toLowerCase()));
        if (!matches) return false;
      }
      if ((b.price ?? 0) > filters.maxPrice) return false;
      if (filters.windows.length) {
        if (!filters.windows.some((w) => inWindow(b.departureTime, w))) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return (a.price ?? 0) - (b.price ?? 0);
        case "price-desc":
          return (b.price ?? 0) - (a.price ?? 0);
        case "departure-asc":
          return toMinutes(a.departureTime) - toMinutes(b.departureTime);
        case "rating-desc":
          return (b.rating ?? 0) - (a.rating ?? 0);
      }
    });
    return list;
  }, [buses, filters, sort]);

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />

      {/* Trip summary */}
      <section className="bg-gradient-header text-primary-foreground py-6">
        <div className="container flex flex-wrap items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            {source} <ArrowRight className="w-5 h-5" /> {destination}
          </h1>
          <span className="text-sm opacity-90">
            • {new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </span>
          {!loading && (
            <span className="ml-auto text-sm font-medium bg-primary-foreground/15 px-3 py-1 rounded-full">
              {filteredSorted.length} of {buses.length} buses
            </span>
          )}
        </div>
      </section>

      <main className="container py-6 flex-1">
        {loading ? (
          <Spinner label="Searching for buses..." />
        ) : buses.length === 0 ? (
          <div className="bg-card border rounded-xl p-12 text-center">
            <h2 className="text-xl font-bold mb-2">No buses found</h2>
            <p className="text-muted-foreground">Try a different route or date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            <ResultsFilters
              value={filters}
              onChange={setFilters}
              priceCap={priceCap}
              busTypeOptions={BUS_TYPE_OPTIONS}
            />

            <section>
              {/* Sort bar */}
              <div className="bg-card border rounded-xl p-3 flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  Showing <strong className="text-foreground">{filteredSorted.length}</strong> buses
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">Sort by</span>
                  <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="departure-asc">Departure: Earliest</SelectItem>
                      <SelectItem value="rating-desc">Rating: Highest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredSorted.length === 0 ? (
                <div className="bg-card border rounded-xl p-10 text-center">
                  <h2 className="text-lg font-bold mb-1">No buses match your filters</h2>
                  <p className="text-sm text-muted-foreground">Try widening your filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSorted.map((b) => (
                    <BusCard key={b.id} bus={b} date={date} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Results;
