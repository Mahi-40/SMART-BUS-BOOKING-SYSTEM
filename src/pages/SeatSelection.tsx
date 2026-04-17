import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Spinner from "@/components/Spinner";
import SeatLayout from "@/components/SeatLayout";
import { Button } from "@/components/ui/button";
import { busApi, seatApi } from "@/api/client";
import type { Bus, Seat } from "@/types";
import { toast } from "sonner";

const SeatSelection = () => {
  const { busId } = useParams<{ busId: string }>();
  const [params] = useSearchParams();
  const date = params.get("date") ?? new Date().toISOString().split("T")[0];
  const navigate = useNavigate();

  const [bus, setBus] = useState<Bus | undefined>();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!busId) return;
    setLoading(true);
    console.log("[SeatSelection] loading bus & seats for busId =", busId);
    Promise.all([busApi.getById(Number(busId)), seatApi.listByBus(Number(busId))])
      .then(([b, s]) => {
        console.log("[SeatSelection] bus:", b, "seats:", s.length);
        setBus(b);
        setSeats(s);
      })
      .catch((err) => {
        console.error("[SeatSelection] failed to load:", err);
        toast.error("Failed to load seat layout");
      })
      .finally(() => setLoading(false));
  }, [busId]);

  const pricePerSeat = bus?.price ?? seats[0]?.price ?? 0;
  const total = useMemo(() => selected.length * pricePerSeat, [selected, pricePerSeat]);

  const toggle = (seatNumber: string) => {
    setSelected((prev) =>
      prev.includes(seatNumber) ? prev.filter((s) => s !== seatNumber) : [...prev, seatNumber]
    );
  };

  const proceed = () => {
    if (selected.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }
    const state = { busId: Number(busId), seats: selected, total, bus, date };
    navigate("/payment", { state });
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />

      {bus && (
        <section className="bg-card border-b">
          <div className="container py-4">
            <h1 className="text-xl font-bold">{bus.name}</h1>
            <p className="text-sm text-muted-foreground">
              {bus.busType} • {bus.source} → {bus.destination} • {bus.departureTime} - {bus.arrivalTime}
            </p>
          </div>
        </section>
      )}

      <main className="container py-6 flex-1 grid lg:grid-cols-[1fr_320px] gap-6">
        <section className="bg-card rounded-xl border p-5 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Select Your Seats</h2>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs mb-6">
            <span className="flex items-center gap-2"><span className="w-5 h-5 rounded seat-available border-2" /> Available</span>
            <span className="flex items-center gap-2"><span className="w-5 h-5 rounded seat-selected border-2" /> Selected</span>
            <span className="flex items-center gap-2"><span className="w-5 h-5 rounded seat-booked border-2" /> Booked</span>
          </div>

          {loading ? <Spinner label="Loading seat layout..." /> : (
            <SeatLayout seats={seats} selected={selected} onToggle={toggle} />
          )}
        </section>

        {/* Summary */}
        <aside className="bg-card rounded-xl border p-5 h-fit lg:sticky lg:top-20">
          <h3 className="font-semibold mb-3">Booking Summary</h3>
          <div className="text-sm space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Selected seats</span>
              <span className="font-medium">{selected.length || "None"}</span>
            </div>
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selected.map((s) => (
                  <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price per seat</span>
              <span className="font-medium">₹{pricePerSeat.toLocaleString("en-IN")}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between text-base">
              <span className="font-semibold">Total</span>
              <span className="font-extrabold text-primary">₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <Button
            className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-bold"
            size="lg"
            onClick={proceed}
            disabled={selected.length === 0}
          >
            Proceed to Payment
          </Button>
        </aside>
      </main>

      <Footer />
    </div>
  );
};

export default SeatSelection;
