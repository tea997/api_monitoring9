/**
 * API Monitoring System — Send Test API Hits
 * 
 * This sends multiple realistic API hits to populate the dashboard
 * with visible charts and data.
 * 
 * Prerequisites: Run test-flow.js first to set up the super admin, client, and API key.
 * 
 * Run: node Demo/send-hits.js
 */

const API_KEY = process.argv[2] || 'apim_a1a549d0b9b42ac614b401e0add07ab360675114';
const HIT_URL = 'http://localhost:5000/api/hit';

const ENDPOINTS = [
    { endpoint: '/api/users', method: 'GET', weight: 25 },
    { endpoint: '/api/users/:id', method: 'GET', weight: 15 },
    { endpoint: '/api/products', method: 'GET', weight: 20 },
    { endpoint: '/api/products', method: 'POST', weight: 10 },
    { endpoint: '/api/orders', method: 'GET', weight: 12 },
    { endpoint: '/api/orders', method: 'POST', weight: 8 },
    { endpoint: '/api/auth/login', method: 'POST', weight: 18 },
    { endpoint: '/api/payments', method: 'POST', weight: 5 },
    { endpoint: '/api/search', method: 'GET', weight: 15 },
    { endpoint: '/api/notifications', method: 'GET', weight: 8 },
];

const SERVICES = ['user-service', 'product-service', 'order-service', 'auth-service', 'payment-service'];
const STATUS_CODES = [
    { code: 200, weight: 60 },
    { code: 201, weight: 15 },
    { code: 204, weight: 5 },
    { code: 400, weight: 8 },
    { code: 401, weight: 4 },
    { code: 403, weight: 2 },
    { code: 404, weight: 3 },
    { code: 500, weight: 2 },
    { code: 502, weight: 1 },
];

function weightedRandom(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    for (const item of items) {
        random -= item.weight;
        if (random <= 0) return item;
    }
    return items[items.length - 1];
}

function randomLatency(statusCode) {
    // Errors tend to have shorter latency (fail fast) or very long (timeout)
    if (statusCode >= 500) return Math.floor(Math.random() * 3000) + 500;
    if (statusCode >= 400) return Math.floor(Math.random() * 200) + 20;
    return Math.floor(Math.random() * 500) + 30;
}

async function sendHit(i) {
    const ep = weightedRandom(ENDPOINTS);
    const status = weightedRandom(STATUS_CODES);
    const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];

    const body = {
        endpoint: ep.endpoint,
        method: ep.method,
        statusCode: status.code,
        latencyMs: randomLatency(status.code),
        serviceName: service,
    };

    try {
        const res = await fetch(HIT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        const icon = res.ok ? '✅' : '❌';
        console.log(`${icon} Hit #${i + 1}: ${ep.method} ${ep.endpoint} → ${status.code} (${body.latencyMs}ms) [${service}]`);
        if (!res.ok) console.log(`   Error: ${data.message}`);
    } catch (err) {
        console.log(`❌ Hit #${i + 1}: Network error — ${err.message}`);
    }
}

async function main() {
    const TOTAL_HITS = 50;
    console.log(`\n🚀 Sending ${TOTAL_HITS} test API hits...`);
    console.log(`   API Key: ${API_KEY.substring(0, 15)}...`);
    console.log(`   Target: ${HIT_URL}\n`);

    for (let i = 0; i < TOTAL_HITS; i++) {
        await sendHit(i);
        // Small delay to avoid overwhelming
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Done! ${TOTAL_HITS} hits sent.`);
    console.log('   Refresh the dashboard at http://localhost:5173 to see the data.');
}

main().catch(console.error);
