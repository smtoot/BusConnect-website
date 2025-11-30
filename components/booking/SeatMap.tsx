import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Seat, SeatMap as SeatMapType } from '@/types/api';

interface SeatMapProps {
    seatMap: SeatMapType;
    selectedSeats: string[];
    onToggleSeat: (seatNumber: string) => void;
}

export function SeatMap({ seatMap, selectedSeats, onToggleSeat }: SeatMapProps) {
    const t = useTranslations('booking.seatSelection');

    const getSeatStatusColor = (seat: Seat, isSelected: boolean) => {
        if (isSelected) return 'bg-primary text-primary-foreground hover:bg-primary/90';
        if (seat.status === 'BOOKED') return 'bg-muted text-muted-foreground cursor-not-allowed';
        if (seat.status === 'HELD') return 'bg-yellow-100 text-yellow-800 cursor-not-allowed border-yellow-200';
        return 'bg-white border-primary text-primary hover:bg-primary/10';
    };

    const renderSeat = (seat: Seat) => {
        const isSelected = selectedSeats.includes(seat.number);
        const isAvailable = seat.status === 'AVAILABLE';

        return (
            <TooltipProvider key={seat.number}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-10 h-10 p-0 rounded-t-lg rounded-b-md border-2 transition-all",
                                getSeatStatusColor(seat, isSelected),
                                !isAvailable && !isSelected && "opacity-50"
                            )}
                            onClick={() => isAvailable && onToggleSeat(seat.number)}
                            disabled={!isAvailable}
                        >
                            {seat.number}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t(`legend.${seat.status.toLowerCase()}`)} - {seat.type}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    // Group seats by row
    const rows = Array.from({ length: seatMap.rows }, (_, i) => {
        const rowNumber = i + 1;
        return seatMap.seats.filter(seat => seat.number.startsWith(rowNumber.toString()));
    });

    return (
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border">
            {/* Driver Area */}
            <div className="w-full flex justify-end mb-8 px-4">
                <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-100">
                    <span className="text-xs text-gray-500">Driver</span>
                </div>
            </div>

            {/* Seats Grid */}
            <div className="space-y-4">
                {rows.map((rowSeats, rowIndex) => (
                    <div key={rowIndex} className="flex justify-between items-center gap-4">
                        {/* Left Side (Window + Aisle) */}
                        <div className="flex gap-2">
                            {rowSeats.slice(0, 2).map(renderSeat)}
                        </div>

                        {/* Aisle */}
                        <div className="flex-1 text-center text-xs text-muted-foreground">
                            {rowIndex + 1}
                        </div>

                        {/* Right Side (Aisle + Window) */}
                        <div className="flex gap-2">
                            {rowSeats.slice(2, 4).map(renderSeat)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-primary bg-white" />
                    <span>{t('legend.available')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary" />
                    <span>{t('legend.selected')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-muted" />
                    <span>{t('legend.booked')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200" />
                    <span>{t('legend.held')}</span>
                </div>
            </div>
        </div>
    );
}
