import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await pool.query(
            `ALTER TABLE registraya_vcard_registros ADD COLUMN hero_slides_json JSON NULL;`
        );
        return NextResponse.json({ message: 'Column hero_slides_json added successfully!' }, { status: 200 });
    } catch (error: any) {
        // If column already exists (Error code 1060), return success basically
        if (error.code === 'ER_DUP_FIELDNAME') {
             return NextResponse.json({ message: 'Column hero_slides_json already exists' }, { status: 200 });
        }
        return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }
}
