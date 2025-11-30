import { useTranslations, useLocale } from 'next-intl';
import { Wifi, Coffee, Battery, Armchair } from 'lucide-react';
import { formatPrice, formatTime, formatDuration } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Trip } from '@/types/api';

interface TripCardProps {
    trip: Trip;
    onSelect: (tripId: string) => void;
}

export function TripCard({ trip, onSelect }: TripCardProps) {
    const t = useTranslations('trip');
    const tCommon = useTranslations('common');
    const locale = useLocale();

    const getAmenityIcon = (amenity: string) => {
        switch (amenity.toLowerCase()) {
            case 'wifi': return <Wifi className="h-4 w-4" />;
            case 'meal': return <Coffee className="h-4 w-4" />;
            case 'usb': return <Battery className="h-4 w-4" />;
            case 'reclining': return <Armchair className="h-4 w-4" />;
            default: return null;
        }
    };

    const [origin, destination] = trip.route.split('→').map(s => s.trim());

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    {/* Company & Route Info */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            {trip.company?.logo && (
                                <img
                                    src={trip.company.logo}
                                    alt={trip.company.name}
                                    className="h-8 w-8 object-contain"
                                />
                            )}
                            <span className="font-semibold text-lg">{trip.company?.name || trip.name || 'Bus Service'}</span>
                            {trip.vehicle?.type && (
                                <span className="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                                    {trip.vehicle.type}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-4 md:gap-8">
                            <div className="text-center min-w-[60px]">
                                <div className="text-xl md:text-2xl font-bold">{formatTime(trip.departureTime, locale)}</div>
                                <div className="text-sm text-muted-foreground">{origin}</div>
                            </div>

                            <div className="flex-1 flex flex-col items-center px-2">
                                <div className="text-xs text-muted-foreground mb-1">
                                    {trip.arrivalTime ? formatDuration(trip.departureTime, trip.arrivalTime, locale) : '-'}
                                </div>
                                <div className="w-full h-px bg-border relative">
                                    <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-primary -translate-y-1/2" />
                                    <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-primary -translate-y-1/2" />
                                </div>
                            </div>

                            <div className="text-center min-w-[60px]">
                                <div className="text-xl md:text-2xl font-bold">{trip.arrivalTime ? formatTime(trip.arrivalTime, locale) : '-'}</div>
                                <div className="text-sm text-muted-foreground">{destination}</div>
                            </div>
                        </div>

                        {trip.vehicle?.amenities && trip.vehicle.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-3 text-muted-foreground">
                                {trip.vehicle.amenities.map((amenity) => (
                                    <div key={amenity} className="flex items-center gap-1 text-xs" title={t(`amenities.${amenity.toLowerCase()}`)}>
                                        {getAmenityIcon(amenity)}
                                        <span className="hidden sm:inline">{t(`amenities.${amenity.toLowerCase()}`)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Price & Action */}
                    <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-s pt-4 md:pt-0 md:ps-6 gap-4">
                        <div className="text-right w-full md:w-auto flex justify-between md:block items-center">
                            <div className="md:text-right">
                                <div className="text-2xl font-bold text-primary">
                                    {formatPrice(trip.price, locale)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {t('perPerson')}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 text-right w-full md:w-auto">
                            <div className="text-xs text-muted-foreground hidden md:block">
                                {t('seatsAvailable', { count: trip.availableSeats || trip.capacity || 0 })}
                            </div>
                            <Button
                                onClick={() => onSelect(trip.id)}
                                className="w-full md:w-auto"
                                disabled={(trip.availableSeats || trip.capacity || 0) === 0}
                            >
                                {tCommon('select')}
                            </Button>
                            <div className="text-xs text-muted-foreground md:hidden text-center mt-1">
                                {t('seatsAvailable', { count: trip.availableSeats || trip.capacity || 0 })}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
```
