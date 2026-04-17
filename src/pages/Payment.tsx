import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { z } from "zod";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookingApi } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Bus } from "@/types";
import { toast } from "sonner";
import { CreditCard, Lock } from "lucide-react";

interface NavState {
  busId: number;
  seats: string[];
  total: number;
  bus?: Bus;
  date: string;
}

const paymentSchema = z.object({
  userName: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be exactly 16 digits"),
  cvv: z.string().regex(/^\d{3}$/, "CVV must be exactly 3 digits"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format"),
});

const Payment = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: NavState | null };
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ userName: user?.name ?? "", cardNumber: "", cvv: "", expiry: "" });

  if (!state || !state.seats?.length) return <Navigate to="/" replace />;

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (k === "cardNumber") v = v.replace(/\D/g, "").slice(0, 16);
    if (k === "cvv") v = v.replace(/\D/g, "").slice(0, 3);
    if (k === "expiry") v = v.replace(/[^\d/]/g, "").slice(0, 5);
    setForm((p) => ({ ...p, [k]: v }));
  };

  const onPay = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = paymentSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    try {
      // Simulate payment latency
      await new Promise((r) => setTimeout(r, 900));
      const booking = await bookingApi.create({
        userName: parsed.data.userName,
        busId: state.busId,
        seatNumbers: state.seats,
        totalAmount: state.total,
      });
      toast.success("Payment successful! Booking confirmed.");
      navigate("/confirmation", { state: { booking, bus: state.bus, date: state.date } });
    } catch (err: any) {
      toast.error(err?.message ?? "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <main className="container py-8 flex-1 grid lg:grid-cols-[1fr_360px] gap-6">
        <form onSubmit={onPay} className="bg-card rounded-xl border p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">Payment Details</h1>
            <span className="ml-auto inline-flex items-center text-xs text-muted-foreground gap-1">
              <Lock className="w-3 h-3" /> Secure (demo)
            </span>
          </div>

          <div>
            <Label htmlFor="name">Passenger Name</Label>
            <Input id="name" value={form.userName} onChange={onChange("userName")} placeholder="As per ID" maxLength={60} />
          </div>

          <div>
            <Label htmlFor="card">Card Number</Label>
            <Input id="card" value={form.cardNumber} onChange={onChange("cardNumber")} placeholder="1234 5678 9012 3456" inputMode="numeric" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exp">Expiry (MM/YY)</Label>
              <Input id="exp" value={form.expiry} onChange={onChange("expiry")} placeholder="12/29" />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input id="cvv" type="password" value={form.cvv} onChange={onChange("cvv")} placeholder="123" inputMode="numeric" />
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-bold" size="lg">
            {submitting ? "Processing..." : `Pay ₹${state.total.toLocaleString("en-IN")}`}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            This is a demo payment. No real transaction occurs.
          </p>
        </form>

        <aside className="bg-card rounded-xl border p-5 h-fit">
          <h3 className="font-semibold mb-3">Trip Summary</h3>
          {state.bus && (
            <div className="text-sm mb-3">
              <p className="font-semibold">{state.bus.name}</p>
              <p className="text-muted-foreground">{state.bus.source} → {state.bus.destination}</p>
              <p className="text-muted-foreground">{new Date(state.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
          )}
          <div className="text-sm space-y-2 border-t pt-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seats</span>
              <span className="font-medium">{state.seats.join(", ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-medium">{state.seats.length}</span>
            </div>
            <div className="flex justify-between text-base border-t pt-2 mt-2">
              <span className="font-semibold">Total</span>
              <span className="font-extrabold text-primary">₹{state.total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;
