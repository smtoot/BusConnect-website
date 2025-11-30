// ============================================
// API Client for BusConnect Backend
// ============================================

import type {
    ApiResponse,
    ApiError,
    TripSearchParams,
    TripSearchResponse,
    TripDetails,
    HoldSeatsRequest,
    HoldSeatsResponse,
    CreateBookingRequest,
    CreateBookingResponse,
    Booking,
    BookingLookupParams,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// --------------------------------------------
// Error Handling
// --------------------------------------------

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

async function handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
        if (isJson) {
            const errorData: ApiError = await response.json();
            throw new ApiClientError(
                errorData.error.message || 'An error occurred',
                response.status,
                errorData.error.code,
                errorData.error.details
            );
        }
        throw new ApiClientError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
        );
    }

    if (isJson) {
        const data: ApiResponse<T> = await response.json();
        return data.data;
    }

    throw new ApiClientError('Invalid response format', response.status);
}

// --------------------------------------------
// Request Helper
// --------------------------------------------

interface RequestOptions extends RequestInit {
    idempotencyKey?: string;
}

async function request<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { idempotencyKey, headers, ...restOptions } = options;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (idempotencyKey) {
        defaultHeaders['Idempotency-Key'] = idempotencyKey;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...restOptions,
        headers: {
            ...defaultHeaders,
            ...headers,
        },
    });

    return handleResponse<T>(response);
}

// --------------------------------------------
// API Endpoints
// --------------------------------------------

export const apiClient = {
    // Trip Search
    searchTrips: async (params: TripSearchParams): Promise<TripSearchResponse> => {
        const queryParams = new URLSearchParams();
        queryParams.append('from', params.from);
        queryParams.append('to', params.to);
        queryParams.append('date', params.date);

        if (params.passengers) {
            queryParams.append('passengers', params.passengers.toString());
        }
        if (params.page) {
            queryParams.append('page', params.page.toString());
        }
        if (params.limit) {
            queryParams.append('limit', params.limit.toString());
        }

        const data = await request<{ trips: any[]; meta: any }>(
            `/api/public/trips/search?${queryParams.toString()}`
        );

        return {
            trips: data.trips || [],
            meta: data.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
        };
    },

    // Get Trip Details
    getTripDetails: async (tripId: string): Promise<TripDetails> => {
        return request<TripDetails>(`/api/public/trips/${tripId}`);
    },

    // Hold Seats
    holdSeats: async (
        data: HoldSeatsRequest,
        idempotencyKey: string
    ): Promise<HoldSeatsResponse> => {
        return request<HoldSeatsResponse>('/api/public/bookings/hold', {
            method: 'POST',
            body: JSON.stringify(data),
            idempotencyKey,
        });
    },

    // Create Booking
    createBooking: async (
        data: CreateBookingRequest,
        idempotencyKey: string
    ): Promise<CreateBookingResponse> => {
        return request<CreateBookingResponse>('/api/public/bookings', {
            method: 'POST',
            body: JSON.stringify(data),
            idempotencyKey,
        });
    },

    // Get Booking Details
    getBooking: async (params: BookingLookupParams): Promise<Booking> => {
        const queryParams = new URLSearchParams();
        queryParams.append('email', params.email);

        return request<Booking>(
            `/api/public/bookings/${params.bookingRef}?${queryParams.toString()}`
        );
    },
};

// --------------------------------------------
// Export Types
// --------------------------------------------

export type { ApiClientError };
