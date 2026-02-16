import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const config = {
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USER,
            database: process.env.MYSQL_DATABASE,
            hasPassword: !!process.env.MYSQL_PASSWORD
        };

        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT 1 as connected');
        connection.release();

        return NextResponse.json({
            status: 'success',
            database: 'connected',
            config: config,
            result: rows
        });
    } catch (err: any) {
        return NextResponse.json({
            status: 'error',
            message: err.message,
            code: err.code,
            config: {
                host: process.env.MYSQL_HOST,
                port: process.env.MYSQL_PORT,
                user: process.env.MYSQL_USER,
                database: process.env.MYSQL_DATABASE
            }
        }, { status: 500 });
    }
}
