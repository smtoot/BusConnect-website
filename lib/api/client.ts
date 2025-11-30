import {
    Trip,
    TripSearchParams,
    CreateBookingRequest,
    Booking,
} from '@/types/api';

// Base URL for API requests
// In development, this points to our Next.js API proxy which forwards to the real backend
const API_BASE_URL = '/api';

export class ApiClientError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public code?: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'ApiClientError';
    }
}

// Helper function for API requests
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiClientError(
            error.message || 'API request failed',
            response.status,
            error.code,
            error.details
        );
    }

    return response.json();
}

export const api = {
    // Trips
    searchTrips: async (params: TripSearchParams): Promise<Trip[]> => {
        const searchParams = new URLSearchParams();
        if (params.from) searchParams.append('from', params.from);
        if (params.to) searchParams.append('to', params.to);
        if (params.date) searchParams.append('date', params.date.toISOString());
        if (params.passengers) searchParams.append('passengers', params.passengers.toString());

        // The proxy returns { data: Trip[], meta: ... }
        const response = await request<{ data: Trip[] }>(`/trips?${searchParams.toString()}`);
        return response.data || [];
    },

    getTripDetails: async (tripId: string): Promise<Trip> => {
        // We'll use the generic search endpoint for now as we don't have a specific ID endpoint in proxy yet
        // Ideally we should add GET /api/trips/[id]
        // For now, let's assume the proxy handles /trips/[id] or we just use it directly
        return request<Trip>(`/trips/${tripId}`);
    },

    // Seats
    holdSeats: async (tripId: string, seatNumbers: string[]): Promise<{ holdId: string; expiresAt: Date }> => {
        // Mock implementation for now as backend requires specific lock endpoint
        // We can implement /api/bookings/lock later
        return {
            holdId: `hold-${Math.random().toString(36).substr(2, 9)}`,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
        };
    },

    // Bookings
    createBooking: async (bookingData: CreateBookingRequest): Promise<Booking> => {
        const response = await request<any>('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        });

        // Backend returns array of bookings (one per passenger), we return the first one
        return Array.isArray(response) ? response[0] : response;
    },

    getBooking: async (bookingRef: string): Promise<Booking> => {
        return request<Booking>(`/bookings/${bookingRef}`);
    },
};
