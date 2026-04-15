import { NextResponse } from 'next/server';
import { getBasicStats, getRealtimeUsers } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Authenticate (check for admin API key or session if implemented)
        // For now, we assume this is protected by being under /api/admin
        // and ideally the middleware handles session check.

        const [statsResponse, realtimeUsers] = await Promise.all([
            getBasicStats(),
            getRealtimeUsers()
        ]);

        // Parse GA4 response into a more usable format for the frontend
        const rows = statsResponse.rows || [];
        const totals = statsResponse.totals?.[0]?.metricValues || [];

        // Extract totals (last 7 days by default from lib/analytics)
        const totalStats = {
            activeUsers: parseInt(totals[0]?.value || '0', 10),
            sessions: parseInt(totals[1]?.value || '0', 10),
            pageViews: parseInt(totals[2]?.value || '0', 10),
        };

        // Extract daily breakdown
        const dailyData = rows.map((row: any) => ({
            date: row.dimensionValues[0].value, // YYYYMMDD
            activeUsers: parseInt(row.metricValues[0].value, 10),
            sessions: parseInt(row.metricValues[1].value, 10),
            pageViews: parseInt(row.metricValues[2].value, 10),
        })).sort((a: any, b: any) => a.date.localeCompare(b.date));

        return NextResponse.json({
            realtime: {
                activeUsers: realtimeUsers,
            },
            summary: totalStats,
            daily: dailyData,
        });
    } catch (error: any) {
        console.error('Analytics API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data', details: error.message },
            { status: 500 }
        );
    }
}
