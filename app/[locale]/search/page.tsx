'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { TripCard } from '@/components/search/TripCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, SlidersHorizontal } from 'lucide-react';
import type { TripSearchParams } from '@/types/api';

export default function SearchPage() {
    const t = useTranslations('search');
    const tFilters = useTranslations('filters');
    const searchParams = useSearchParams();
    const router = useRouter();

    const [showFilters, setShowFilters] = useState(false);

    const params: TripSearchParams = {
        from: searchParams.get('from') || '',
        to: searchParams.get('to') || '',
        date: searchParams.get('date') || '',
        passengers: Number(searchParams.get('passengers')) || 1,
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ['trips', params],
        queryFn: () => api.searchTrips(params),
        enabled: !!params.from && !!params.to && !!params.date,
    });

    const handleSelectTrip = (tripId: string) => {
        router.push(`/trips/${tripId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Search Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-bold">
                            {params.from} → {params.to}
                        </h1>
                        <div className="text-sm text-muted-foreground">
                            {params.date} • {params.passengers} {t('passengers')}
                        </div>
                    </div>
                    {/* Mobile Filter Toggle */}
                    <Button
                        variant="outline"
                        className="md:hidden w-full"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        {tFilters('title')}
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 flex gap-8">
                {/* Filters Sidebar */}
                <aside className={`w-full md:w-64 bg-white p-6 rounded-lg shadow-sm h-fit ${showFilters ? 'block' : 'hidden md:block'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-semibold">{tFilters('title')}</h2>
                        <Filter className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {/* Placeholder Filters */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium mb-3">{tFilters('price')}</h3>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-2/3" />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                <span>50 SAR</span>
                                <span>500 SAR</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium mb-3">{tFilters('departureTime')}</h3>
                            <div className="space-y-2">
                                {['06:00 - 12:00', '12:00 - 18:00', '18:00 - 00:00'].map((time) => (
                                    <label key={time} className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" className="rounded border-gray-300" />
                                        {time}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Results List */}
                <div className="flex-1 space-y-4">
                    {isLoading ? (
                        // Loading Skeletons
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-lg p-6 shadow-sm space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-8 w-32" />
                                    <Skeleton className="h-8 w-24" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-12 w-48" />
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            </div>
                        ))
                    ) : error ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                            <p className="text-destructive mb-2">{t('error')}</p>
                            <Button onClick={() => window.location.reload()} variant="outline">
                                Try Again
                            </Button>
                        </div>
                    ) : data?.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                            <p className="text-muted-foreground mb-4">{t('noResults')}</p>
                            <Button onClick={() => router.push('/')} variant="outline">
                                {t('modifySearch')}
                            </Button>
                        </div>
                    ) : (
                        data?.map((trip) => (
                            <TripCard
                                key={trip.id}
                                trip={trip}
                                onSelect={handleSelectTrip}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
