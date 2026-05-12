import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function simulateCronQuery() {
    const db = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    const CESAR_ID = 11;
    
    // Simulating exactly the same query as in app/api/admin/cron/payment-reminders/route.ts
    const query = `
        SELECT id, nombre, whatsapp, status, created_at, last_reminder_at, reminder_count 
        FROM registraya_vcard_registros
        WHERE status = 'pendiente'
        AND (seller_id = ? OR seller_id IS NULL)
        AND (
            (reminder_count = 0 AND created_at <= DATE_SUB(NOW(), INTERVAL 3 DAY)) OR
            (reminder_count = 1 AND created_at <= DATE_SUB(NOW(), INTERVAL 7 DAY)) OR
            (reminder_count = 2 AND created_at <= DATE_SUB(NOW(), INTERVAL 15 DAY))
        )
        AND (last_reminder_at IS NULL OR last_reminder_at <= DATE_SUB(NOW(), INTERVAL 2 DAY))
        LIMIT 50
    `;

    console.log('--- Simulando Query de Recordatorios ---');
    const [rows]: any = await db.execute(query, [CESAR_ID]);
    
    console.log(`Encontrados: ${rows.length} registros.`);
    fs.writeFileSync(path.join(__dirname, '../simulated_cron_output.json'), JSON.stringify(rows, null, 2));

    await db.end();
}

simulateCronQuery().catch(console.error);
