'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useMutation } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useBookingStore } from '@/store/bookingStore';
import { apiClient } from '@/lib/api/client';
import { generateIdempotencyKey } from '@/lib/utils/idempotency';
import { formatPrice } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Lock } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm() {
    const t = useTranslations('booking.payment');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();
    const stripe = useStripe();
    const elements = useElements();

    const {
        selectedTrip,
        selectedSeats,
        holdId,
        passengers,
        setPaymentInfo,
        reset
    } = useBookingStore();

    const [isProcessing, setIsProcessing] = useState(false);

    const createBookingMutation = useMutation({
        mutationFn: async (paymentIntentId: string) => {
            const idempotencyKey = generateIdempotencyKey();
            return apiClient.createBooking({
                tripId: selectedTrip!.id,
                holdId: holdId!,
                passengers,
                contactEmail: passengers[0]?.email || '', // Assuming first passenger email as contact
                contactPhone: passengers[0]?.phone || '', // Assuming first passenger phone as contact
                paymentIntentId,
            }, idempotencyKey);
        },
        onSuccess: (data) => {
            setPaymentInfo(data.paymentIntentId, data.bookingReference);
            router.push(`/booking/confirmation/${data.bookingReference}`);
            // Reset store after successful booking
            setTimeout(() => reset(), 1000);
        },
        onError: (error: any) => {
            alert(error.message || tCommon('error'));
            setIsProcessing(false);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements || !holdId) {
            return;
        }

        setIsProcessing(true);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/booking/confirmation`,
                },
                redirect: 'if_required',
            });

            if (error) {
                alert(error.message);
                setIsProcessing(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Create booking
                createBookingMutation.mutate(paymentIntent.id);
            }
        } catch (err: any) {
            alert(err.message || tCommon('error'));
            setIsProcessing(false);
        }
    };

    const totalPrice = (selectedTrip?.price || 0) * selectedSeats.length;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        {t('title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <PaymentElement />

                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>{t('seats', { count: selectedSeats.length })}</span>
                            <span>{selectedSeats.join(', ')}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                            <span>{t('total')}</span>
                            <span className="text-primary">{formatPrice(totalPrice, locale)}</span>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={!stripe || isProcessing || createBookingMutation.isPending}
                    >
                        {isProcessing || createBookingMutation.isPending ? tCommon('loading') : t('confirmPayment')}
                        {!isProcessing && !createBookingMutation.isPending && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                        {t('securePayment')}
                    </p>
                </CardContent>
            </Card>
        </form>
    );
}

export default function PaymentPage() {
    const t = useTranslations('booking.payment');
    const router = useRouter();
    const { holdId, selectedSeats, selectedTrip } = useBookingStore();
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    useEffect(() => {
        if (!holdId || selectedSeats.length === 0) {
            router.push('/');
            return;
        }

        // In a real implementation, you would call your backend to create a PaymentIntent
        // and get the client secret. For now, we'll use a placeholder.
        // TODO: Implement backend endpoint to create PaymentIntent
        const mockClientSecret = 'pi_mock_secret_' + Date.now();
        setClientSecret(mockClientSecret);
    }, [holdId, selectedSeats, router]);

    if (!holdId || !clientSecret) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-2xl">
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
        },
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <h1 className="text-2xl font-bold mb-8">{t('title')}</h1>

                <Elements stripe={stripePromise} options={options}>
                    <PaymentForm />
                </Elements>
            </div>
        </div>
    );
}
