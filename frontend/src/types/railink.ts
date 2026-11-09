export type UserRole = "PENUMPANG" | "ADMIN" | "PETUGAS";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "CANCELLED";

export type TicketStatus =
  | "BOOKED"
  | "BOARDED";

export interface Train {
  id: string;
  code: string;
  name: string;
  className: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  availableSeats: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Passenger {
  name: string;
  identity: string;
}

export interface Booking {
  id: string;
  code: string;
  passenger: string;
  train: string;
  route: string;
  date: string;
  total: number;
  status: PaymentStatus;
}

export interface Ticket {
  id: string;
  bookingCode: string;
  passengerName: string;
  trainName: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  seatNumber: string;
  status: TicketStatus;
}