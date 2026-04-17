import { Link } from "react-router-dom";
import { Star, Clock, Armchair, IndianRupee } from "lucide-react";
import type { Bus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  bus: Bus;
  date: string;
}

const BusCard = ({ bus, date }: Props) => {
  const seatsLeft = bus.availableSeats ?? 0;
  const lowSeats = seatsLeft > 0 && seatsLeft <= 5;

  return (
    <article className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-smooth p-5 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Operator */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold truncate">{bus.name}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {bus.busType ?? "AC Sleeper"}
            </Badge>
            {bus.rating !== undefined && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-success-foreground bg-success px-2 py-0.5 rounded">
                <Star className="w-3 h-3 fill-current" /> {bus.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Times */}
        <div className="flex items-center gap-4 text-center">
          <div>
            <p className="text-xl font-bold">{bus.departureTime ?? "—"}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[80px]">{bus.source}</p>
          </div>
          <div className="flex flex-col items-center text-xs text-muted-foreground">
            <Clock className="w-4 h-4 mb-1" />
            <span>{bus.duration ?? "—"}</span>
            <span className="block w-12 border-t mt-1" />
          </div>
          <div>
            <p className="text-xl font-bold">{bus.arrivalTime ?? "—"}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[80px]">{bus.destination}</p>
          </div>
        </div>

        {/* Seats + price */}
        <div className="text-center md:text-right">
          <p
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              lowSeats ? "text-destructive" : "text-success"
            }`}
          >
            <Armchair className="w-3 h-3" />
            {lowSeats ? `Only ${seatsLeft} seats left` : `${seatsLeft} Seats Left`}
          </p>
          <p className="text-2xl font-extrabold text-primary mt-1 inline-flex items-center">
            <IndianRupee className="w-5 h-5" />
            {bus.price?.toLocaleString("en-IN") ?? "—"}
          </p>
        </div>

        {/* CTA */}
        <Button asChild size="lg" className="bg-primary hover:bg-primary-dark text-primary-foreground font-semibold">
          <Link to={`/seats/${bus.id}?date=${encodeURIComponent(date)}`}>Select Seats</Link>
        </Button>
      </div>
    </article>
  );
};

export default BusCard;
