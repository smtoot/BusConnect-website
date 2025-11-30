import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL;
const BACKEND_API_TOKEN = process.env.BACKEND_API_TOKEN;

export async function GET(request: NextRequest) {
    try {
        if (!BACKEND_API_URL || !BACKEND_API_TOKEN) {
            console.error('Backend configuration missing');
            return NextResponse.json(
                { message: 'Server configuration error' },
                { status: 500 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const date = searchParams.get('date');

        // Construct backend query URL
        const backendUrl = new URL(`${BACKEND_API_URL}/trips`);

        // Map frontend specific search to backend generic search
        // Backend uses 'search' parameter for name, route, tripId
        if (from && to) {
            backendUrl.searchParams.append('search', `${from} to ${to}`);
        } else if (from) {
            backendUrl.searchParams.append('search', from);
        } else if (to) {
            backendUrl.searchParams.append('search', to);
        }

        // Forward other params like page, limit
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');
        if (page) backendUrl.searchParams.append('page', page);
        if (limit) backendUrl.searchParams.append('limit', limit);

        // Note: Backend doesn't seem to filter by date in the generic search endpoint 
        // based on our analysis (it only does text search on name/route/tripId).
        // We might need to filter client-side or ask backend team to add date filtering.
        // For now, we'll fetch and filter if needed, or just pass what we can.

        const response = await fetch(backendUrl.toString(), {
            headers: {
                'Authorization': `Bearer ${BACKEND_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Backend error:', response.status, errorData);
            return NextResponse.json(
                { message: 'Error fetching trips from backend', details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Optional: Filter by date here if backend doesn't support it
        // This is a temporary workaround until backend adds date filtering
        let trips = data.data || [];
        if (date) {
            const searchDate = new Date(date).toISOString().split('T')[0];
            trips = trips.filter((trip: any) => {
                const tripDate = new Date(trip.departureDate).toISOString().split('T')[0];
                return tripDate === searchDate;
            });
            data.data = trips;
            data.meta.total = trips.length; // Update total count roughly
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
