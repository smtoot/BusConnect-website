// ============================================
// API Types for BusConnect Backend Integration
// ============================================

// --------------------------------------------
// Common Types
// --------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// --------------------------------------------
// Trip Types
// --------------------------------------------

export interface Trip {
  id: string;
  route: string;
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:mm
  arrivalTime: string; // HH:mm
  price: number;
  availableSeats: number;
  totalSeats: number;
  company: Company;
  vehicle: Vehicle;
}

export interface TripDetails extends Trip {
  seatMap: SeatMap;
}

export interface Company {
  name: string;
  logo?: string;
}

export interface Vehicle {
  type: string;
  amenities: string[];
}

export interface TripSearchParams {
  from: string;
  to: string;
  date: string; // YYYY-MM-DD
  passengers?: number;
  page?: number;
  limit?: number;
}

export interface TripSearchResponse {
  trips: Trip[];
  meta: PaginationMeta;
}

// --------------------------------------------
// Seat Types
// --------------------------------------------

export type SeatStatus = 'AVAILABLE' | 'BOOKED' | 'HELD';
export type SeatType = 'window' | 'aisle' | 'middle';

export interface Seat {
  number: string;
  status: SeatStatus;
  type: SeatType;
  expiresAt?: string; // ISO 8601 timestamp (for HELD seats)
}

export interface SeatMap {
  layout: string; // e.g., "2-2" (seats per row)
  rows: number;
  seats: Seat[];
}

// --------------------------------------------
// Booking Types
// --------------------------------------------

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type IdType = 'NATIONAL_ID' | 'PASSPORT';

export interface HoldSeatsRequest {
  tripId: string;
  seatNumbers: string[];
}

export interface HoldSeatsResponse {
  holdId: string;
  expiresAt: string; // ISO 8601 timestamp
  seatNumbers: string[];
  tripId: string;
}

export interface PassengerInput {
  name: string;
  email: string;
  phone: string;
  idType: IdType;
  idNumber: string;
}

export interface CreateBookingRequest {
  holdId: string;
  passengers: PassengerInput[];
  contactEmail: string;
  contactPhone: string;
  paymentMethod: 'stripe';
}

export interface CreateBookingResponse {
  bookingRef: string;
  amount: number;
  currency: string;
  payment: PaymentIntent;
  expiresAt: string; // ISO 8601 timestamp
}

export interface PaymentIntent {
  paymentId: string;
  clientSecret: string;
  publishableKey: string;
}

export interface Booking {
  bookingRef: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  trip: TripDetails;
  passengers: PassengerInput[];
  totalAmount: number;
  currency: string;
  createdAt: string; // ISO 8601 timestamp
}

export interface BookingLookupParams {
  bookingRef: string;
  email: string;
}

// --------------------------------------------
// Filter Types
// --------------------------------------------

export interface TripFilters {
  priceRange?: {
    min: number;
    max: number;
  };
  departureTimeRange?: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
  companies?: string[];
  amenities?: string[];
}
