import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function checkReminders() {
    const db = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    console.log('--- Registros Pendientes (registraya_vcard_registros) ---');
    const [rows]: any = await db.execute(`
        SELECT id, nombre, nombre_negocio, whatsapp, status, created_at, last_reminder_at, reminder_count 
        FROM registraya_vcard_registros 
        WHERE status = 'pendiente'
        ORDER BY created_at DESC
        LIMIT 50
    `);

    fs.writeFileSync(path.join(__dirname, '../records_output.json'), JSON.stringify(rows, null, 2));
    
    console.log('\n--- Fecha Actual Sincronizada ---');
    const now = new Date();
    console.log(now.toISOString());
    console.log('Local Time:', now.toLocaleString());

    await db.end();
}

checkReminders().catch(console.error);
