import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { resolve } from 'path';
import fs from 'fs';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function check() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT || 3306),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        // Schema
        const [desc] = await connection.execute("DESCRIBE registraya_whatsapp_messages");
        fs.writeFileSync('scripts/msg_schema.json', JSON.stringify(desc, null, 2), 'utf8');

        // Dormant chats
        const [queue] = await connection.execute('SELECT jid, MAX(created_at) as last FROM registraya_whatsapp_message_queue WHERE processed = 0 GROUP BY jid');
        fs.writeFileSync('scripts/dormant.json', JSON.stringify(queue, null, 2), 'utf8');

        // Clear only queue and sessions to be safe until we confirm table name
        await connection.execute('DELETE FROM registraya_whatsapp_sessions');
        await connection.execute('DELETE FROM registraya_whatsapp_message_queue');
        await connection.execute('DELETE FROM registraya_whatsapp_leads');

        console.log("Memory cleared. Check msg_schema.json and dormant.json");

    } catch (e) {
        console.error("Error BD:", e);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

check();
