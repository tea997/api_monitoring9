/**
 * API Monitoring System — Full Demo Test Script
 * 
 * This script tests the complete flow:
 * 1. Onboard Super Admin
 * 2. Login as Super Admin
 * 3. Create a Client
 * 4. List Clients
 * 5. Create a Client User
 * 6. Create an API Key
 * 7. List API Keys
 * 8. Send a test API hit using the generated key
 * 
 * Run: node Demo/test-flow.js
 */

const BASE_URL = 'http://localhost:5000/api';

// ---- Config ----
const SUPER_ADMIN = {
    username: 'superadmin',
    email: 'admin@apimonitor.com',
    password: '[PASSWORD]',
};

const CLIENT = {
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    description: 'Demo client for testing',
    website: 'https://acme.com',
};

const CLIENT_USER = {
    username: 'acme_viewer',
    email: 'viewer@acme.com',
    password: 'Viewer@123',
    role: 'client_viewer',
};

const API_KEY_DATA = {
    name: 'Production Key',
    description: 'Key for production API hits',
    environment: 'production',
};

// ---- Helpers ----
let authCookie = '';

async function request(method, path, body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(authCookie ? { Cookie: authCookie } : {}),
        },
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, options);
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
        authCookie = setCookie.split(';')[0];
    }

    const data = await res.json();
    return { status: res.status, data };
}

function log(step, result) {
    const icon = result.data?.success ? '✅' : '❌';
    console.log(`\n${icon} Step: ${step}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.data?.message || 'N/A'}`);
    if (result.data?.data && typeof result.data.data === 'object') {
        const preview = JSON.stringify(result.data.data, null, 2).split('\n').slice(0, 8).join('\n');
        console.log(`   Data: ${preview}...`);
    }
    return result;
}

// ---- Demo Flow ----
async function runDemo() {
    console.log('='.repeat(60));
    console.log('  API Monitoring System — Full Demo Test');
    console.log('='.repeat(60));

    // 1. Onboard Super Admin
    console.log('\n📌 PHASE 1: Authentication');
    const onboard = await request('POST', '/auth/onboard-super-admin', SUPER_ADMIN);
    log('Onboard Super Admin', onboard);

    // If onboarding fails (already done), just login
    if (!onboard.data?.success) {
        console.log('   ℹ️  Super Admin already exists, logging in instead...');
    }

    // 2. Login
    const login = await request('POST', '/auth/login', {
        username: SUPER_ADMIN.username,
        password: SUPER_ADMIN.password,
    });
    log('Login as Super Admin', login);

    if (!login.data?.success) {
        console.log('\n❌ Login failed. Cannot continue demo.');
        return;
    }

    // 3. Get Profile
    const profile = await request('GET', '/auth/profile');
    log('Get Profile', profile);

    // 4. Create Client
    console.log('\n📌 PHASE 2: Client Management');
    const createClient = await request('POST', '/admin/clients', CLIENT);
    log('Create Client', createClient);

    // 5. List Clients
    const listClients = await request('GET', '/admin/clients');
    log('List Clients', listClients);

    const clientId = listClients.data?.data?.clients?.[0]?._id;
    if (!clientId) {
        console.log('\n❌ No client ID found. Cannot continue.');
        return;
    }
    console.log(`   🔑 Using Client ID: ${clientId}`);

    // 6. Create Client User
    console.log('\n📌 PHASE 3: User Management');
    const createUser = await request('POST', `/admin/clients/${clientId}/users`, CLIENT_USER);
    log('Create Client User', createUser);

    // 7. Create API Key
    console.log('\n📌 PHASE 4: API Key Management');
    const createKey = await request('POST', `/admin/clients/${clientId}/api-keys`, API_KEY_DATA);
    log('Create API Key', createKey);

    const keyValue = createKey.data?.data?.keyValue;
    if (keyValue) {
        console.log(`   🔐 Generated Key: ${keyValue}`);
    }

    // 8. List API Keys
    const listKeys = await request('GET', `/admin/clients/${clientId}/api-keys`);
    log('List API Keys', listKeys);

    // 9. Send a test API hit
    if (keyValue) {
        console.log('\n📌 PHASE 5: Test API Hit');
        const hitResult = await fetch('http://localhost:5000/api/hit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': keyValue,
            },
            body: JSON.stringify({
                endpoint: '/users/list',
                method: 'GET',
                statusCode: 200,
                responseTime: 142,
                serviceName: 'demo-service',
            }),
        });
        const hitData = await hitResult.json();
        log('Send Test API Hit', { status: hitResult.status, data: hitData });
    }

    // 10. Check Dashboard
    console.log('\n📌 PHASE 6: Dashboard');
    const dashboard = await request('GET', '/analytics/dashboard');
    log('Get Dashboard Data', dashboard);

    console.log('\n' + '='.repeat(60));
    console.log('  ✅ Demo Complete!');
    console.log('  Open http://localhost:5173 in your browser to see the dashboard');
    console.log('  Login: username=superadmin  password=Admin@123');
    console.log('='.repeat(60));
}

runDemo().catch(err => {
    console.error('Demo failed:', err.message);
});
