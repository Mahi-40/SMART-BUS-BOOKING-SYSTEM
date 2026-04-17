// Type definitions matching the Spring Boot backend entities
export interface Bus {
  id: number;
  name: string;
  source: string;
  destination: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  busType?: string; // e.g. "AC Sleeper", "Volvo Multi-Axle"
  price?: number;
  rating?: number;
  totalSeats?: number;
  availableSeats?: number;
}

export interface Seat {
  id: number;
  seatNumber: string;
  booked: boolean;
  busId: number;
  price?: number;
}

export interface Booking {
  id?: number;
  userName: string;
  busId: number;
  seatNumbers: string[]; // List form
  bookingTime?: string;
  totalAmount?: number;
}

export interface BookingRequest {
  userName: string;
  busId: number;
  seatNumbers: string[];
  totalAmount: number;
}
