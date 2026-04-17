import { Link, Navigate, useLocation } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Home } from "lucide-react";
import type { Booking, Bus } from "@/types";

interface NavState {
  booking: Booking;
  bus?: Bus;
  date: string;
}

const Confirmation = () => {
  const { state } = useLocation() as { state: NavState | null };
  if (!state?.booking) return <Navigate to="/" replace />;
  const { booking, bus, date } = state;

  const print = () => window.print();

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <main className="container py-10 flex-1 max-w-2xl">
        <div className="bg-card rounded-2xl border shadow-md overflow-hidden animate-slide-up">
          {/* Banner */}
          <div className="bg-success text-success-foreground p-6 text-center">
            <CheckCircle2 className="w-14 h-14 mx-auto mb-2" />
            <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
            <p className="text-sm opacity-90">Your e-ticket has been generated successfully.</p>
          </div>

          {/* Ticket body */}
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start pb-4 border-b border-dashed">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Booking ID</p>
                <p className="text-lg font-bold text-primary">#BK{booking.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Booked on</p>
                <p className="text-sm font-medium">
                  {booking.bookingTime ? new Date(booking.bookingTime).toLocaleString("en-IN") : "Just now"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Passenger</p>
                <p className="font-semibold">{booking.userName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Date of Travel</p>
                <p className="font-semibold">
                  {new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              {bus && (
                <>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground uppercase">Bus</p>
                    <p className="font-semibold">{bus.name}</p>
                    <p className="text-muted-foreground text-xs">{bus.busType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">From</p>
                    <p className="font-semibold">{bus.source}</p>
                    <p className="text-xs text-muted-foreground">{bus.departureTime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">To</p>
                    <p className="font-semibold">{bus.destination}</p>
                    <p className="text-xs text-muted-foreground">{bus.arrivalTime}</p>
                  </div>
                </>
              )}
            </div>

            <div className="bg-secondary rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Seats</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {booking.seatNumbers.map((s) => (
                    <span key={s} className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase">Amount Paid</p>
                <p className="text-xl font-extrabold text-primary">
                  ₹{booking.totalAmount?.toLocaleString("en-IN") ?? "—"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
              <Button onClick={print} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" /> Print Ticket
              </Button>
              <Button asChild className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground">
                <Link to="/"><Home className="w-4 h-4 mr-2" /> Book Another</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Confirmation;
