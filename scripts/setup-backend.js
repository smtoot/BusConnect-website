const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:3001/api';
const SERVICE_USER = {
    companyName: 'BusConnect Website',
    slug: 'busconnect-website',
    email: 'website-api@busconnect.com',
    password: 'ServiceAccount123!',
    name: 'Website Service Account',
    adminName: 'Website Service Account' // Required by Zod schema
};

const ENV_FILE_PATH = path.join(__dirname, '../.env.local');

async function setup() {
    console.log('🚀 Starting Backend Integration Setup...');

    let token = null;

    // 1. Try to Register
    console.log('Attempting to register service account...');
    try {
        const regResponse = await fetch(`${BACKEND_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(SERVICE_USER)
        });

        if (regResponse.status === 201) {
            const data = await regResponse.json();
            token = data.token;
            console.log('✅ Service account created successfully!');
        } else {
            const error = await regResponse.json();
            console.log(`ℹ️ Registration skipped: ${error.message}`);
        }
    } catch (e) {
        console.error('❌ Failed to connect to backend. Is it running on port 3001?');
        process.exit(1);
    }

    // 2. If not registered (likely exists), Try to Login
    if (!token) {
        console.log('Attempting to login...');
        const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: SERVICE_USER.email,
                password: SERVICE_USER.password
            })
        });

        if (loginResponse.ok) {
            const data = await loginResponse.json();
            token = data.token;
            console.log('✅ Login successful!');
        } else {
            const error = await loginResponse.json();
            console.error(`❌ Login failed: ${error.message}`);
            console.error('Please check if the backend is running and the user exists with the correct password.');
            process.exit(1);
        }
    }

    // 3. Update .env.local
    if (token) {
        console.log('📝 Updating .env.local...');

        let envContent = '';
        if (fs.existsSync(ENV_FILE_PATH)) {
            envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
        }

        // Helper to update or add variable
        const updateVar = (key, value) => {
            const regex = new RegExp(`^${key}=.*`, 'm');
            if (regex.test(envContent)) {
                envContent = envContent.replace(regex, `${key}=${value}`);
            } else {
                envContent += `\n${key}=${value}`;
            }
        };

        updateVar('BACKEND_API_URL', BACKEND_URL);
        updateVar('BACKEND_API_TOKEN', token);

        fs.writeFileSync(ENV_FILE_PATH, envContent);
        console.log('✅ .env.local updated successfully!');
        console.log('\n🎉 Backend integration setup complete! You can now run the frontend.');
    }
}

setup().catch(console.error);
