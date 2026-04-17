import { supabase } from "@/integrations/supabase/client";
import type { Bus, Seat, Booking, BookingRequest } from "@/types";

/**
 * API client backed by Lovable Cloud (Supabase).
 * Replaces the previous Spring Boot + mock backend with persistent storage.
 */

// Map DB row (snake_case) → app type (camelCase)
function mapBus(row: any): Bus {
  return {
    id: row.id,
    name: row.name,
    source: row.source,
    destination: row.destination,
    departureTime: row.departure_time,
    arrivalTime: row.arrival_time,
    duration: row.duration,
    busType: row.bus_type,
    price: Number(row.price),
    rating: row.rating ? Number(row.rating) : undefined,
    totalSeats: row.total_seats,
    availableSeats: row.available_seats,
  };
}

function mapSeat(row: any, busPrice?: number): Seat {
  return {
    id: row.id,
    seatNumber: row.seat_number,
    booked: row.booked,
    busId: row.bus_id,
    price: busPrice,
  };
}

export const busApi = {
  async list(source?: string, destination?: string): Promise<Bus[]> {
    console.log("[api] busApi.list", { source, destination });
    let query = supabase.from("buses").select("*");
    if (source) query = query.ilike("source", source);
    if (destination) query = query.ilike("destination", destination);
    const { data, error } = await query;
    if (error) {
      console.error("[api] busApi.list error", error);
      throw error;
    }

    // Compute availableSeats for each bus
    const buses = (data ?? []).map(mapBus);
    if (buses.length === 0) return buses;

    const ids = buses.map((b) => b.id);
    const { data: seatRows } = await supabase
      .from("seats")
      .select("bus_id, booked")
      .in("bus_id", ids);

    const stats = new Map<number, number>();
    (seatRows ?? []).forEach((s: any) => {
      if (!s.booked) stats.set(s.bus_id, (stats.get(s.bus_id) ?? 0) + 1);
    });
    return buses.map((b) => ({ ...b, availableSeats: stats.get(b.id) ?? b.totalSeats }));
  },

  async getById(id: number): Promise<Bus | undefined> {
    console.log("[api] busApi.getById", id);
    const { data, error } = await supabase.from("buses").select("*").eq("id", id).maybeSingle();
    if (error) {
      console.error("[api] busApi.getById error", error);
      throw error;
    }
    return data ? mapBus(data) : undefined;
  },
};

export const seatApi = {
  async listByBus(busId: number): Promise<Seat[]> {
    console.log("[api] seatApi.listByBus", busId);
    const [{ data, error }, busRes] = await Promise.all([
      supabase.from("seats").select("*").eq("bus_id", busId).order("id"),
      supabase.from("buses").select("price").eq("id", busId).maybeSingle(),
    ]);
    if (error) {
      console.error("[api] seatApi.listByBus error", error);
      throw error;
    }
    const price = busRes.data ? Number(busRes.data.price) : undefined;
    return (data ?? []).map((r) => mapSeat(r, price));
  },

  async book(seatId: number): Promise<Seat> {
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("seats")
      .update({ booked: true, booked_by: userData.user?.id })
      .eq("id", seatId)
      .select()
      .single();
    if (error) throw error;
    return mapSeat(data);
  },
};

export const bookingApi = {
  async create(req: BookingRequest): Promise<Booking> {
    console.log("[api] bookingApi.create", req);
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) throw new Error("You must be logged in to book");

    // Mark seats as booked
    const { error: seatErr } = await supabase
      .from("seats")
      .update({ booked: true, booked_by: userData.user.id })
      .eq("bus_id", req.busId)
      .in("seat_number", req.seatNumbers)
      .eq("booked", false);
    if (seatErr) {
      console.error("[api] seat update failed", seatErr);
      throw seatErr;
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: userData.user.id,
        bus_id: req.busId,
        passenger_name: req.userName,
        seat_numbers: req.seatNumbers,
        total_amount: req.totalAmount,
      })
      .select()
      .single();
    if (error) {
      console.error("[api] bookingApi.create error", error);
      throw error;
    }
    return {
      id: data.id,
      userName: data.passenger_name,
      busId: data.bus_id,
      seatNumbers: data.seat_numbers,
      totalAmount: Number(data.total_amount),
      bookingTime: data.booking_time,
    };
  },

  async list(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("booking_time", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((b: any) => ({
      id: b.id,
      userName: b.passenger_name,
      busId: b.bus_id,
      seatNumbers: b.seat_numbers,
      totalAmount: Number(b.total_amount),
      bookingTime: b.booking_time,
    }));
  },
};
