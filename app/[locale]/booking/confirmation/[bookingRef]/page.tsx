'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { formatPrice, formatTime, formatDate } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Download, Mail, Home } from 'lucide-react';

export default function ConfirmationPage({ params }: { params: Promise<{ bookingRef: string }> }) {
    const [bookingRef, setBookingRef] = React.useState<string>('');

    React.useEffect(() => {
        params.then(p => setBookingRef(p.bookingRef));
    }, [params]);

    const t = useTranslations('booking.confirmation');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();

    const { data: booking, isLoading, error } = useQuery({
        queryKey: ['booking', bookingRef],
        queryFn: () => apiClient.getBooking(bookingRef, ''), // Email should be from store or URL param
        enabled: !!bookingRef,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-3xl">
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-3xl text-center">
                    <p className="text-destructive mb-4">{tCommon('error')}</p>
                    <Button onClick={() => router.push('/')}>{tCommon('backToHome')}</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>

                {/* Booking Reference */}
                <Card className="mb-6 border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">{t('bookingReference')}</p>
                            <p className="text-3xl font-bold text-primary tracking-wider">{booking.bookingReference}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Trip Details */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{t('tripDetails')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">{t('route')}</p>
                                <p className="font-semibold">{booking.trip.route}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('date')}</p>
                                <p className="font-semibold">{formatDate(booking.trip.departureTime, locale)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('departure')}</p>
                                <p className="font-semibold">{formatTime(booking.trip.departureTime, locale)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('arrival')}</p>
                                <p className="font-semibold">{formatTime(booking.trip.arrivalTime, locale)}</p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <p className="text-sm text-muted-foreground mb-2">{t('seats')}</p>
                            <div className="flex flex-wrap gap-2">
                                {booking.seats.map(seat => (
                                    <span key={seat} className="bg-primary/10 text-primary px-3 py-1 rounded-md font-medium">
                                        {seat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Passengers */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{t('passengers')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {booking.passengers.map((passenger, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                                    <div>
                                        <p className="font-medium">{passenger.firstName} {passenger.lastName}</p>
                                        <p className="text-sm text-muted-foreground">{passenger.idType}: {passenger.idNumber}</p>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{booking.seats[index]}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Summary */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>{t('paymentSummary')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>{t('totalPaid')}</span>
                                <span className="font-bold text-lg text-primary">{formatPrice(booking.totalPrice, locale)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{t('paymentStatus')}</span>
                                <span className="text-green-600 font-medium">{booking.paymentStatus}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" className="flex-1" onClick={() => window.print()}>
                        <Download className="mr-2 h-4 w-4" />
                        {t('downloadTicket')}
                    </Button>
                    <Button variant="outline" className="flex-1">
                        <Mail className="mr-2 h-4 w-4" />
                        {t('emailTicket')}
                    </Button>
                    <Button className="flex-1" onClick={() => router.push('/')}>
                        <Home className="mr-2 h-4 w-4" />
                        {tCommon('backToHome')}
                    </Button>
                </div>

                {/* Email Notice */}
                <p className="text-center text-sm text-muted-foreground mt-8">
                    {t('emailSent', { email: booking.contactEmail })}
                </p>
            </div>
        </div>
    );
}
