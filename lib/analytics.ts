import { BetaAnalyticsDataClient } from '@google-analytics/data';

/**
 * Google Analytics 4 Data Client
 */
const getAnalyticsClient = () => {
    const credentials = JSON.parse(process.env.GOOGLE_ANALYTICS_CREDENTIALS || '{}');

    return new BetaAnalyticsDataClient({
        credentials: {
            client_email: credentials.client_email,
            private_key: credentials.private_key?.replace(/\\n/g, '\n'),
        },
        projectId: credentials.project_id,
    });
};

export const getBasicStats = async () => {
    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
    if (!propertyId) {
        throw new Error('GOOGLE_ANALYTICS_PROPERTY_ID is not defined');
    }

    const client = getAnalyticsClient();

    // Fetch multiple metrics in one go
    const [response] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
            {
                startDate: '7daysAgo',
                endDate: 'today',
            },
        ],
        dimensions: [
            {
                name: 'date',
            },
        ],
        metrics: [
            {
                name: 'activeUsers',
            },
            {
                name: 'sessions',
            },
            {
                name: 'screenPageViews',
            },
        ],
    });

    return response;
};

/**
 * Returns real-time active users (last 30 minutes)
 */
export const getRealtimeUsers = async () => {
    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
    if (!propertyId) {
        throw new Error('GOOGLE_ANALYTICS_PROPERTY_ID is not defined');
    }

    const client = getAnalyticsClient();

    const [response] = await client.runRealtimeReport({
        property: `properties/${propertyId}`,
        metrics: [
            {
                name: 'activeUsers',
            },
        ],
    });

    const activeUsers = response.rows?.[0]?.metricValues?.[0]?.value || '0';
    return parseInt(activeUsers, 10);
};
