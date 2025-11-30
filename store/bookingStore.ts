// ============================================
// Booking Store - State Management with Zustand
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PassengerInput, Trip } from '@/types/api';

// --------------------------------------------
// Store State Interface
// --------------------------------------------

interface BookingState {
    // Trip Selection
    selectedTrip: Trip | null;

    // Seat Selection
    selectedSeats: string[];
    holdId: string | null;
    holdExpiresAt: Date | null;

    // Passenger Details
    passengers: PassengerInput[];
    contactEmail: string;
    contactPhone: string;

    // Payment
    bookingRef: string | null;
    paymentClientSecret: string | null;

    // Actions
    setSelectedTrip: (trip: Trip) => void;
    toggleSeat: (seatNumber: string) => void;
    setSelectedSeats: (seats: string[]) => void;
    setHold: (holdId: string, expiresAt: Date) => void;
    clearHold: () => void;
    setPassengers: (passengers: PassengerInput[]) => void;
    setContactInfo: (email: string, phone: string) => void;
    setPaymentInfo: (bookingRef: string, clientSecret: string) => void;
    reset: () => void;

    // Computed
    isHoldExpired: () => boolean;
    getTotalAmount: () => number;
}

// --------------------------------------------
// Initial State
// --------------------------------------------

const initialState = {
    selectedTrip: null,
    selectedSeats: [],
    holdId: null,
    holdExpiresAt: null,
    passengers: [],
    contactEmail: '',
    contactPhone: '',
    bookingRef: null,
    paymentClientSecret: null,
};

// --------------------------------------------
// Store Implementation
// --------------------------------------------

export const useBookingStore = create<BookingState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // Set selected trip
            setSelectedTrip: (trip) => {
                set({ selectedTrip: trip });
            },

            // Toggle seat selection
            toggleSeat: (seatNumber) => {
                set((state) => {
                    const isSelected = state.selectedSeats.includes(seatNumber);
                    return {
                        selectedSeats: isSelected
                            ? state.selectedSeats.filter((s) => s !== seatNumber)
                            : [...state.selectedSeats, seatNumber],
                    };
                });
            },

            // Set selected seats (replace all)
            setSelectedSeats: (seats) => {
                set({ selectedSeats: seats });
            },

            // Set seat hold information
            setHold: (holdId, expiresAt) => {
                set({ holdId, holdExpiresAt: expiresAt });
            },

            // Clear seat hold
            clearHold: () => {
                set({ holdId: null, holdExpiresAt: null });
            },

            // Set passenger information
            setPassengers: (passengers) => {
                set({ passengers });
            },

            // Set contact information
            setContactInfo: (email, phone) => {
                set({ contactEmail: email, contactPhone: phone });
            },

            // Set payment information
            setPaymentInfo: (bookingRef, clientSecret) => {
                set({ bookingRef, paymentClientSecret: clientSecret });
            },

            // Reset entire booking state
            reset: () => {
                set(initialState);
            },

            // Check if hold is expired
            isHoldExpired: () => {
                const { holdExpiresAt } = get();
                if (!holdExpiresAt) return false;
                return new Date() > new Date(holdExpiresAt);
            },

            // Calculate total amount
            getTotalAmount: () => {
                const { selectedTrip, selectedSeats } = get();
                if (!selectedTrip) return 0;
                return selectedTrip.price * selectedSeats.length;
            },
        }),
        {
            name: 'busconnect-booking',
            partialize: (state) => ({
                // Only persist essential data
                selectedTrip: state.selectedTrip,
                selectedSeats: state.selectedSeats,
                holdId: state.holdId,
                holdExpiresAt: state.holdExpiresAt,
                passengers: state.passengers,
                contactEmail: state.contactEmail,
                contactPhone: state.contactPhone,
            }),
            // Custom storage with expiration
            storage: {
                getItem: (name) => {
                    const str = localStorage.getItem(name);
                    if (!str) return null;

                    try {
                        const { state, timestamp } = JSON.parse(str);
                        const now = Date.now();
                        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

                        // Clear if expired
                        if (now - timestamp > maxAge) {
                            localStorage.removeItem(name);
                            return null;
                        }

                        return { state };
                    } catch {
                        return null;
                    }
                },
                setItem: (name, value) => {
                    const str = JSON.stringify({
                        state: value.state,
                        timestamp: Date.now(),
                    });
                    localStorage.setItem(name, str);
                },
                removeItem: (name) => {
                    localStorage.removeItem(name);
                },
            },
        }
    )
);

// --------------------------------------------
// Selectors (for optimized re-renders)
// --------------------------------------------

export const selectSelectedTrip = (state: BookingState) => state.selectedTrip;
export const selectSelectedSeats = (state: BookingState) => state.selectedSeats;
export const selectHoldInfo = (state: BookingState) => ({
    holdId: state.holdId,
    holdExpiresAt: state.holdExpiresAt,
});
export const selectPassengers = (state: BookingState) => state.passengers;
export const selectTotalAmount = (state: BookingState) => state.getTotalAmount();
