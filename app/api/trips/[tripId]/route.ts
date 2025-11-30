import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tripId: string }> }
) {
    try {
        const { tripId } = await params;
        const backendUrl = process.env.BACKEND_API_URL;
        const backendToken = process.env.BACKEND_API_TOKEN;

        if (!backendUrl || !backendToken) {
            return NextResponse.json(
                { error: 'Backend configuration missing' },
                { status: 500 }
            );
        }

        // Fetch trip details from backend
        const response = await fetch(`${backendUrl}/trips/${tripId}`, {
            headers: {
                'Authorization': `Bearer ${backendToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend error: ${response.status} - ${errorText}`);
            return NextResponse.json(
                { error: 'Failed to fetch trip details' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching trip details:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
