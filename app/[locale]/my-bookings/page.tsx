'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { bookingLookupSchema, type BookingLookupData } from '@/lib/validators/schemas';
import { formatPrice, formatTime, formatDate } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Mail, Calendar, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BookingDetails } from '@/types/api';

export default function MyBookingsPage() {
    const t = useTranslations('myBookings');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const [booking, setBooking] = useState<BookingDetails | null>(null);

    const form = useForm<BookingLookupData>({
        resolver: zodResolver(bookingLookupSchema),
        defaultValues: {
            bookingReference: '',
            email: '',
        },
    });

    const lookupMutation = useMutation({
        mutationFn: (data: BookingLookupData) =>
            apiClient.getBooking(data.bookingReference, data.email),
        onSuccess: (data) => {
            setBooking(data);
        },
        onError: (error: any) => {
            alert(error.message || t('notFound'));
            setBooking(null);
        }
    });

    const onSubmit = (data: BookingLookupData) => {
        lookupMutation.mutate(data);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>

                {/* Search Form */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            {t('searchTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bookingReference">{t('bookingReference')}</Label>
                                    <Input
                                        id="bookingReference"
                                        placeholder="ABC123"
                                        {...form.register('bookingReference')}
                                        className={cn(form.formState.errors.bookingReference && "border-destructive")}
                                    />
                                    {form.formState.errors.bookingReference && (
                                        <p className="text-xs text-destructive">{tCommon('required')}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('email')}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@example.com"
                                        {...form.register('email')}
                                        className={cn(form.formState.errors.email && "border-destructive")}
                                    />
                                    {form.formState.errors.email && (
                                        <p className="text-xs text-destructive">{tCommon('required')}</p>
                                    )}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={lookupMutation.isPending}
                            >
                                {lookupMutation.isPending ? tCommon('loading') : t('search')}
                                {!lookupMutation.isPending && <Search className="ml-2 h-4 w-4" />}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Booking Details */}
                {lookupMutation.isPending && (
                    <Skeleton className="h-96 w-full rounded-xl" />
                )}

                {booking && (
                    <div className="space-y-6">
                        {/* Booking Reference */}
                        <Card className="border-primary/20 bg-primary/5">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-2">{t('bookingReference')}</p>
                                    <p className="text-2xl font-bold text-primary tracking-wider">{booking.bookingReference}</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {t('status')}: <span className="font-medium text-green-600">{booking.status}</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trip Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    {t('tripDetails')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('route')}</p>
                                        <p className="font-semibold">{booking.trip.route}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('company')}</p>
                                        <p className="font-semibold">{booking.trip.company.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('date')}</p>
                                        <p className="font-semibold">{formatDate(booking.trip.departureTime, locale)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('time')}</p>
                                        <p className="font-semibold">
                                            {formatTime(booking.trip.departureTime, locale)} - {formatTime(booking.trip.arrivalTime, locale)}
                                        </p>
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    {t('passengers')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {booking.passengers.map((passenger, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                                            <div>
                                                <p className="font-medium">{passenger.firstName} {passenger.lastName}</p>
                                                <p className="text-sm text-muted-foreground">{passenger.nationality}</p>
                                            </div>
                                            <span className="text-sm text-muted-foreground">{booking.seats[index]}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('paymentInfo')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">{t('totalPaid')}</span>
                                    <span className="text-2xl font-bold text-primary">{formatPrice(booking.totalPrice, locale)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Button variant="outline" className="flex-1" onClick={() => window.print()}>
                                {t('printTicket')}
                            </Button>
                            <Button variant="outline" className="flex-1">
                                <Mail className="mr-2 h-4 w-4" />
                                {t('resendEmail')}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
