// ============================================
// Idempotency Key Generator
// ============================================

import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique idempotency key for API requests
 * Used to prevent duplicate bookings and seat holds
 */
export function generateIdempotencyKey(): string {
    return uuidv4();
}

/**
 * Stores an idempotency key in sessionStorage to prevent duplicate requests
 * Returns true if the key is new, false if it was already used
 */
export function useIdempotencyKey(key: string, context: string): boolean {
    if (typeof window === 'undefined') return true;

    const storageKey = `idempotency_${context}_${key}`;
    const existing = sessionStorage.getItem(storageKey);

    if (existing) {
        return false; // Key was already used
    }

    sessionStorage.setItem(storageKey, new Date().toISOString());
    return true; // New key
}

/**
 * Clears idempotency keys for a specific context
 */
export function clearIdempotencyKeys(context: string): void {
    if (typeof window === 'undefined') return;

    const prefix = `idempotency_${context}_`;
    const keysToRemove: string[] = [];

    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(prefix)) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
}
