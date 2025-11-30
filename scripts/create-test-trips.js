const fs = require('fs');
const path = require('path');

const ENV_FILE_PATH = path.join(__dirname, '../.env.local');

// Helper to read env file
function getEnvVar(key) {
    if (process.env[key]) return process.env[key];
    if (fs.existsSync(ENV_FILE_PATH)) {
        const content = fs.readFileSync(ENV_FILE_PATH, 'utf8');
        const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
        return match ? match[1] : null;
    }
    return null;
}

const BACKEND_URL = getEnvVar('BACKEND_API_URL') || 'http://localhost:3001/api';
const TOKEN = getEnvVar('BACKEND_API_TOKEN');

if (!TOKEN) {
    console.error('❌ No BACKEND_API_TOKEN found in .env.local. Please run setup-backend.js first.');
    process.exit(1);
}

const TRIPS = [
    {
        tripId: 'TRIP-001',
        name: 'Morning Express',
        route: 'Riyadh to Jeddah',
        departureDate: new Date(Date.now() + 86400000).toISOString(), // Full ISO string
        departureTime: '08:00',
        capacity: 45,
        price: 150,
        status: 'UPCOMING'
    },
    {
        tripId: 'TRIP-002',
        name: 'Evening Standard',
        route: 'Riyadh to Jeddah',
        departureDate: new Date(Date.now() + 86400000).toISOString(),
        departureTime: '18:00',
        capacity: 50,
        price: 120,
        status: 'UPCOMING'
    },
    {
        tripId: 'TRIP-003',
        name: 'Business Class',
        route: 'Jeddah to Riyadh',
        departureDate: new Date(Date.now() + 172800000).toISOString(),
        departureTime: '09:00',
        capacity: 30,
        price: 250,
        status: 'UPCOMING'
    },
    {
        tripId: 'TRIP-004',
        name: 'Night Owl',
        route: 'Dammam to Riyadh',
        departureDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        departureTime: '23:00',
        capacity: 45,
        price: 100,
        status: 'UPCOMING'
    }
];

async function createTrips() {
    console.log('🚀 Creating Test Trips...');

    for (const trip of TRIPS) {
        try {
            console.log(`Creating trip: ${trip.name} (${trip.route})...`);

            const response = await fetch(`${BACKEND_URL}/trips`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TOKEN}`
                },
                body: JSON.stringify(trip)
            });

            const data = await response.json();

            if (response.ok) {
                console.log(`✅ Created ${trip.tripId}`);
            } else {
                console.error(`❌ Failed to create ${trip.tripId} (Status ${response.status}):`);
                console.error(JSON.stringify(data, null, 2));
            }
        } catch (e) {
            console.error(`❌ Error creating ${trip.tripId}:`, e.message);
        }
    }

    console.log('\n🎉 Test trips creation complete!');
}

createTrips().catch(console.error);
