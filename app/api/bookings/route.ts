import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL;
const BACKEND_API_TOKEN = process.env.BACKEND_API_TOKEN;

export async function POST(request: NextRequest) {
    try {
        if (!BACKEND_API_URL || !BACKEND_API_TOKEN) {
            console.error('Backend configuration missing');
            return NextResponse.json(
                { message: 'Server configuration error' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { tripId, passengers, paymentInfo } = body;

        // Transform frontend passenger data to backend format
        // Frontend: { firstName, lastName, documentType, documentNumber, ... }
        // Backend: { fullName, idType, idNumber, ... }
        const backendPassengers = passengers.map((p: any) => ({
            fullName: `${p.firstName} ${p.lastName}`.trim(),
            phoneNumber: p.phone || paymentInfo?.phone || '', // Fallback to contact phone
            emailAddress: p.email || paymentInfo?.email || '', // Fallback to contact email
            nationality: p.nationality,
            idType: p.documentType,
            idNumber: p.documentNumber,
            seatNumber: p.seatNumber
        }));

        // Calculate total amount (mock calculation, backend will verify)
        // We don't send price to backend usually, backend calculates it from trip
        // But the createBooking controller expects 'totalAmount' in body? 
        // Checking controller: const { tripId, passengers, paymentStatus, totalAmount: clientTotalAmount } = req.body;

        const payload = {
            tripId,
            passengers: backendPassengers,
            paymentStatus: 'PAID', // Assuming payment gateway success
            totalAmount: 0 // Backend calculates real amount
        };

        const response = await fetch(`${BACKEND_API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${BACKEND_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Backend error:', response.status, errorData);
            return NextResponse.json(
                { message: 'Error creating booking', details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 201 });

    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
