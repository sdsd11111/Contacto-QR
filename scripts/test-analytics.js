// Test script for GA4 connection
require('dotenv').config({ path: '.env.local' });
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

async function testConnection() {
    console.log('Testing GA4 Connection...');
    console.log('Property ID:', process.env.GOOGLE_ANALYTICS_PROPERTY_ID);

    try {
        const credentials = JSON.parse(process.env.GOOGLE_ANALYTICS_CREDENTIALS || '{}');
        const client = new BetaAnalyticsDataClient({
            credentials: {
                client_email: credentials.client_email,
                private_key: credentials.private_key?.replace(/\\n/g, '\n'),
            },
            projectId: credentials.project_id,
        });

        const [response] = await client.runReport({
            property: `properties/${process.env.GOOGLE_ANALYTICS_PROPERTY_ID}`,
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
            metrics: [{ name: 'activeUsers' }],
        });

        console.log('✅ Success! Connection established.');
        console.log('Report output:', JSON.stringify(response, null, 2));
    } catch (error) {
        console.error('❌ Error connecting to GA4:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

testConnection();
