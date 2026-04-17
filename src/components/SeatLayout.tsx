import type { Seat } from "@/types";


interface Props {
  seats: Seat[];
  selected: string[];
  onToggle: (seatNumber: string) => void;
}

/**
 * Bus seat layout. Lower deck and upper deck (if seat numbers prefixed with U)
 * are rendered in two columns of 2+1 sleeper-style berths.
 */
const SeatLayout = ({ seats, selected, onToggle }: Props) => {
  const lower = seats.filter((s) => !s.seatNumber.startsWith("U"));
  const upper = seats.filter((s) => s.seatNumber.startsWith("U"));

  const renderDeck = (deck: Seat[], label: string) => (
    <div className="flex-1 min-w-[200px]">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{label}</p>
      <div className="bg-secondary/50 rounded-xl border p-4 relative">
        {/* Steering icon for lower */}
        {label === "Lower Deck" && (
          <div className="absolute top-3 right-3 text-muted-foreground" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          </div>
        )}
        <div className="grid grid-cols-[1fr_1fr_24px_1fr] gap-2">
          {deck.map((seat, i) => {
            const isSelected = selected.includes(seat.seatNumber);
            const cls = seat.booked
              ? "seat seat-booked"
              : isSelected
              ? "seat seat-selected"
              : "seat seat-available";
            // Insert aisle gap visually using grid
            const colStart = (i % 4) + 1;
            return (
              <button
                key={seat.id}
                type="button"
                disabled={seat.booked}
                onClick={() => onToggle(seat.seatNumber)}
                className={cls}
                style={{ gridColumn: colStart === 3 ? "auto" : undefined }}
                aria-label={`Seat ${seat.seatNumber} ${seat.booked ? "booked" : isSelected ? "selected" : "available"}`}
              >
                {seat.seatNumber}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {renderDeck(lower, "Lower Deck")}
      {upper.length > 0 && renderDeck(upper, "Upper Deck")}
    </div>
  );
};

export default SeatLayout;
