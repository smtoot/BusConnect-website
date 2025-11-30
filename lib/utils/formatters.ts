// ============================================
// Locale-Aware Formatters
// ============================================

/**
 * Formats a price amount with currency symbol
 * @param amount - The price amount
 * @param locale - The locale ('ar' or 'en')
 * @param currency - The currency code (default: 'SAR')
 */
export function formatPrice(
    amount: number,
    locale: string,
    currency: string = 'SAR'
): string {
    const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';

    return new Intl.NumberFormat(localeCode, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Formats a number with locale-specific numerals
 * @param num - The number to format
 * @param locale - The locale ('ar' or 'en')
 */
export function formatNumber(num: number, locale: string): string {
    const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.NumberFormat(localeCode).format(num);
}

/**
 * Formats a date with locale-specific formatting
 * For Arabic, includes both Gregorian and Hijri dates
 * @param date - The date to format
 * @param locale - The locale ('ar' or 'en')
 */
export function formatDate(date: Date | string, locale: string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';

    if (locale === 'ar') {
        const gregorian = dateObj.toLocaleDateString(localeCode, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        // Hijri calendar
        const hijri = dateObj.toLocaleDateString('ar-SA-u-ca-islamic', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        return `${gregorian} (${hijri})`;
    }

    return dateObj.toLocaleDateString(localeCode, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Formats a date for display in short format
 * @param date - The date to format
 * @param locale - The locale ('ar' or 'en')
 */
export function formatDateShort(date: Date | string, locale: string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';

    return dateObj.toLocaleDateString(localeCode, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Formats a time in 24-hour format
 * @param time - The time string (HH:mm)
 * @param locale - The locale ('ar' or 'en')
 */
export function formatTime(time: string, locale: string): string {
    const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    return date.toLocaleTimeString(localeCode, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

/**
 * Calculates duration between two times
 * @param startTime - Start time (HH:mm)
 * @param endTime - End time (HH:mm)
 * @param locale - The locale ('ar' or 'en')
 */
export function formatDuration(
    startTime: string,
    endTime: string,
    locale: string
): string {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (locale === 'ar') {
        if (minutes === 0) {
            return `${formatNumber(hours, locale)} ساعة`;
        }
        return `${formatNumber(hours, locale)} ساعة و ${formatNumber(minutes, locale)} دقيقة`;
    }

    if (minutes === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
}

/**
 * Formats a phone number for display
 * @param phone - The phone number
 * @param locale - The locale ('ar' or 'en')
 */
export function formatPhoneNumber(phone: string, locale: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // For Saudi numbers (+966)
    if (cleaned.startsWith('966')) {
        const number = cleaned.slice(3);
        if (locale === 'ar') {
            return `${formatNumber(parseInt(number), locale)}+ ٩٦٦`;
        }
        return `+966 ${number}`;
    }

    return phone;
}
