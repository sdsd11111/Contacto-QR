import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function debugSharwest() {
    const db = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    const [rows]: any = await db.execute(`
        SELECT id, nombre, status, seller_id, created_at, last_reminder_at, reminder_count, NOW() as db_now
        FROM registraya_vcard_registros 
        WHERE nombre LIKE '%Sharwest%'
    `);

    console.log(JSON.stringify(rows, null, 2));

    if (rows.length > 0) {
        const r = rows[0];
        console.log('\n--- Evaluación de Condiciones ---');
        console.log('1. Status pendiente:', r.status === 'pendiente');
        console.log('2. Seller ID (11 o NULL):', r.seller_id === 11 || r.seller_id === null);
        
        const createdAt = new Date(r.created_at);
        const dbNow = new Date(r.db_now);
        const diffDays = (dbNow.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        console.log('3. Días desde creación:', diffDays);
        console.log('   - Condición (>= 1 día):', diffDays >= 1);

        if (r.last_reminder_at) {
            const lastRem = new Date(r.last_reminder_at);
            const diffLastRem = (dbNow.getTime() - lastRem.getTime()) / (1000 * 60 * 60 * 24);
            console.log('4. Días desde último recordatorio:', diffLastRem);
            console.log('   - Condición (>= 2 días):', diffLastRem >= 2);
        } else {
            console.log('4. Último recordatorio: NULL (Pasa Filtro)');
        }
    }

    await db.end();
}

debugSharwest().catch(console.error);
