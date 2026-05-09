import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/admin/migrations/expand-json-override
// Migrates json_override column from TEXT (65KB limit) to MEDIUMTEXT (16MB limit)
// Run once to fix "Unterminated string in JSON" errors when saving multiple images.
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let conn;
    try {
        conn = await (pool as any).getConnection();

        // Check current column type
        const [cols] = await conn.query(
            `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() 
             AND TABLE_NAME = 'registros' 
             AND COLUMN_NAME = 'json_override'`
        );

        const currentType = cols[0]?.COLUMN_TYPE?.toLowerCase() || 'unknown';

        if (currentType === 'mediumtext' || currentType === 'longtext') {
            return NextResponse.json({
                success: true,
                message: `No migration needed. Column is already ${currentType}.`,
                currentType
            });
        }

        // Run migration
        await conn.query(
            `ALTER TABLE registros MODIFY COLUMN json_override MEDIUMTEXT`
        );

        // Also expand hero_slides_json and catalogo_json while we're at it
        await conn.query(
            `ALTER TABLE registros MODIFY COLUMN hero_slides_json MEDIUMTEXT`
        );
        await conn.query(
            `ALTER TABLE registros MODIFY COLUMN catalogo_json MEDIUMTEXT`
        );

        return NextResponse.json({
            success: true,
            message: 'Migration successful. json_override, hero_slides_json and catalogo_json are now MEDIUMTEXT (16MB limit).',
            previousType: currentType
        });

    } catch (err: any) {
        console.error('[Migration] expand-json-override failed:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
