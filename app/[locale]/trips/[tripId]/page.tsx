'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useBookingStore } from '@/store/bookingStore';
import { generateIdempotencyKey } from '@/lib/utils/idempotency';
import { formatPrice, formatTime, formatDuration } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/button';
import { SeatMap } from '@/components/booking/SeatMap';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Clock } from 'lucide-react';

export default function TripDetailsPage({ params }: { params: Promise<{ tripId: string }> }) {
    const [tripId, setTripId] = React.useState<string>('');

    React.useEffect(() => {
        params.then(p => setTripId(p.tripId));
    }, [params]);

    const t = useTranslations('booking');
    const tTrip = useTranslations('trip');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();

    // Store
    const {
        selectedSeats,
        toggleSeat,
        setSelectedTrip,
        setHold,
        reset
    } = useBookingStore();

    // Fetch Trip Details
    const { data: trip, isLoading, error } = useQuery({
        queryKey: ['trip', tripId],
        queryFn: () => api.getTripDetails(tripId),
    });

    // Set selected trip in store when loaded
    useEffect(() => {
        if (trip) {
            setSelectedTrip(trip);
        }
    }, [trip, setSelectedTrip]);

    // Hold Seats Mutation
    const holdSeatsMutation = useMutation({
        mutationFn: async () => {
            const idempotencyKey = generateIdempotencyKey();
            return api.holdSeats(tripId, selectedSeats);
        },
        onSuccess: (data) => {
            setHold(data.holdId, new Date(data.expiresAt));
            router.push('/booking/passengers');
        },
        onError: (error: any) => {
            alert(error.message || tCommon('error'));
        }
    });

    const handleContinue = () => {
        holdSeatsMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-8">
                <Skeleton className="h-64 w-full rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Skeleton className="h-96 md:col-span-2 rounded-xl" />
                    <Skeleton className="h-96 rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !trip) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <p className="text-destructive mb-4">{tCommon('error')}</p>
                <Button onClick={() => router.back()}>{tCommon('back')}</Button>
            </div>
        );
    }

    const totalPrice = trip.price * selectedSeats.length;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Trip Header */}
            <div className="bg-primary text-primary-foreground py-8">
                <div className="container mx-auto px-4">
                    <Button
                        variant="ghost"
                        className="text-white hover:bg-white/10 mb-4 pl-0 hover:text-white"
                        onClick={() => router.back()}
                    >
                        ← {tCommon('back')}
                    </Button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">{trip.route}</h1>
                            <div className="flex items-center gap-4 text-blue-100">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatTime(trip.departureTime, locale)} - {trip.arrivalTime ? formatTime(trip.arrivalTime, locale) : '?'}</span>
                                </div>
                                <span>•</span>
                                <span>{trip.duration || (trip.arrivalTime ? formatDuration(trip.departureTime, trip.arrivalTime, locale) : '-')}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">{formatPrice(trip.price, locale)}</div>
                            <div className="text-blue-100 text-sm">{tTrip('perPerson')}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Seat Map */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-semibold">{t('seatSelection.title')}</h2>
                        {trip.seatMap ? (
                            <SeatMap
                                seatMap={trip.seatMap}
                                selectedSeats={selectedSeats}
                                onToggleSeat={toggleSeat}
                            />
                        ) : (
                            <div className="p-8 text-center border rounded-xl bg-gray-50 text-muted-foreground">
                                {tCommon('error')} - Seat map data missing
                            </div>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24 space-y-6">
                            <h3 className="font-semibold text-lg border-b pb-4">{t('seatSelection.selectedSeats')}</h3>

                            {selectedSeats.length === 0 ? (
                                <p className="text-muted-foreground text-sm py-4 text-center">
                                    {t('steps.seats')}
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {selectedSeats.map(seat => (
                                        <span key={seat} className="bg-primary/10 text-primary px-3 py-1 rounded-md font-medium">
                                            {seat}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="border-t pt-4 space-y-4">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>{t('seatSelection.totalPrice')}</span>
                                    <span className="text-primary">{formatPrice(totalPrice, locale)}</span>
                                </div>

                                <Button
                                    className="w-full"
                                    size="lg"
                                    disabled={selectedSeats.length === 0 || holdSeatsMutation.isPending}
                                    onClick={handleContinue}
                                >
                                    {holdSeatsMutation.isPending ? tCommon('loading') : tCommon('continue')}
                                    {!holdSeatsMutation.isPending && <ArrowRight className="ml-2 h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
