'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useBookingStore } from '@/store/bookingStore';
import { PassengerForm } from '@/components/booking/PassengerForm';
import { Button } from '@/components/ui/button';
import { passengerSchema, type Passenger } from '@/lib/validators/schemas';
import { ArrowRight } from 'lucide-react';

export default function PassengersPage() {
    const t = useTranslations('booking.passengerForm');
    const tCommon = useTranslations('common');
    const router = useRouter();
    const { selectedSeats, holdId, passengers, setPassengers } = useBookingStore();
    const [errors, setErrors] = useState<Record<number, any>>({});

    useEffect(() => {
        if (!holdId || selectedSeats.length === 0) {
            router.push('/');
        }
    }, [holdId, selectedSeats, router]);

    // Initialize passengers if empty
    useEffect(() => {
        if (passengers.length !== selectedSeats.length) {
            const initialPassengers = selectedSeats.map(() => ({
                firstName: '',
                lastName: '',
                idType: 'NATIONAL_ID' as const,
                idNumber: '',
                nationality: 'SA',
            }));
            setPassengers(initialPassengers);
        }
    }, [selectedSeats, passengers.length, setPassengers]);

    const handleUpdatePassenger = (index: number, data: Passenger) => {
        const newPassengers = [...passengers];
        newPassengers[index] = data;
        setPassengers(newPassengers);

        // Clear error for this index if any
        if (errors[index]) {
            const newErrors = { ...errors };
            delete newErrors[index];
            setErrors(newErrors);
        }
    };

    const handleSubmit = () => {
        const newErrors: Record<number, any> = {};
        let isValid = true;

        passengers.forEach((passenger, index) => {
            const result = passengerSchema.safeParse(passenger);
            if (!result.success) {
                isValid = false;
                newErrors[index] = result.error.flatten().fieldErrors;
            }
        });

        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        router.push('/booking/payment');
    };

    if (!holdId) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <h1 className="text-2xl font-bold mb-8">{t('title')}</h1>

                <div className="space-y-6">
                    {selectedSeats.map((seat, index) => (
                        <PassengerForm
                            key={seat}
                            index={index}
                            seatNumber={seat}
                            defaultValues={passengers[index]}
                            onUpdate={handleUpdatePassenger}
                            errors={errors[index]}
                        />
                    ))}

                    <div className="flex justify-end pt-6">
                        <Button size="lg" onClick={handleSubmit}>
                            {tCommon('continue')}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
