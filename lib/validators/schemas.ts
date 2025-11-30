// ============================================
// Validation Schemas using Zod
// ============================================

import { z } from 'zod';

// --------------------------------------------
// Search Form Schema
// --------------------------------------------

export const searchFormSchema = z.object({
    from: z.string().min(2, 'Please enter a departure city').max(100),
    to: z.string().min(2, 'Please enter a destination city').max(100),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    passengers: z.number().min(1, 'At least 1 passenger required').max(50, 'Maximum 50 passengers'),
});

export type SearchFormData = z.infer<typeof searchFormSchema>;

// --------------------------------------------
// Passenger Schema
// --------------------------------------------

export const passengerSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters')
        .regex(/^[a-zA-Z\u0600-\u06FF\s]+$/, 'Name can only contain letters and spaces'),

    email: z
        .string()
        .email('Invalid email address')
        .max(255, 'Email must not exceed 255 characters'),

    phone: z
        .string()
        .regex(
            /^\+?[1-9]\d{1,14}$/,
            'Invalid phone number format. Use international format (e.g., +966501234567)'
        ),

    idType: z.enum(['NATIONAL_ID', 'PASSPORT']),

    idNumber: z
        .string()
        .min(5, 'ID number must be at least 5 characters')
        .max(20, 'ID number must not exceed 20 characters')
        .regex(/^[A-Z0-9]+$/i, 'ID number can only contain letters and numbers'),
});

export type PassengerFormData = z.infer<typeof passengerSchema>;

// --------------------------------------------
// Passenger Details Form Schema (Multiple Passengers)
// --------------------------------------------

export const passengerDetailsFormSchema = z.object({
    passengers: z.array(passengerSchema).min(1, 'At least one passenger is required'),
    contactEmail: z.string().email('Invalid contact email'),
    contactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid contact phone number'),
    acceptTerms: z.boolean().refine((val) => val === true, {
        message: 'You must accept the terms and conditions',
    }),
});

export type PassengerDetailsFormData = z.infer<typeof passengerDetailsFormSchema>;

// --------------------------------------------
// Booking Lookup Schema
// --------------------------------------------

export const bookingLookupSchema = z.object({
    bookingRef: z
        .string()
        .min(5, 'Booking reference must be at least 5 characters')
        .max(20, 'Booking reference must not exceed 20 characters')
        .regex(/^[A-Z0-9-]+$/i, 'Invalid booking reference format'),

    email: z.string().email('Invalid email address'),
});

export type BookingLookupFormData = z.infer<typeof bookingLookupSchema>;

// --------------------------------------------
// Validation Error Messages (Localized)
// --------------------------------------------

export const validationMessages = {
    en: {
        required: 'This field is required',
        invalidEmail: 'Invalid email address',
        invalidPhone: 'Invalid phone number',
        minLength: (min: number) => `Must be at least ${min} characters`,
        maxLength: (max: number) => `Must not exceed ${max} characters`,
        invalidFormat: 'Invalid format',
    },
    ar: {
        required: 'هذا الحقل مطلوب',
        invalidEmail: 'عنوان البريد الإلكتروني غير صالح',
        invalidPhone: 'رقم الهاتف غير صالح',
        minLength: (min: number) => `يجب أن يكون ${min} أحرف على الأقل`,
        maxLength: (max: number) => `يجب ألا يتجاوز ${max} حرفًا`,
        invalidFormat: 'تنسيق غير صالح',
    },
};

// --------------------------------------------
// Custom Validation Helpers
// --------------------------------------------

/**
 * Validates if a date is in the future
 */
export function isFutureDate(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
}

/**
 * Validates Saudi national ID format (10 digits)
 */
export function isValidSaudiNationalId(id: string): boolean {
    return /^\d{10}$/.test(id);
}

/**
 * Validates passport number format
 */
export function isValidPassport(passport: string): boolean {
    return /^[A-Z0-9]{6,20}$/i.test(passport);
}
