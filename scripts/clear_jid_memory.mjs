import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function clearJid() {
    const targetJid = "593967491847@s.whatsapp.net";
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT || 3306),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        console.log(`Borrando memoria para: ${targetJid}`);

        await connection.execute('DELETE FROM registraya_whatsapp_messages WHERE jid = ?', [targetJid]);
        await connection.execute('DELETE FROM registraya_whatsapp_leads WHERE jid = ?', [targetJid]);
        await connection.execute('DELETE FROM registraya_whatsapp_sessions WHERE jid = ?', [targetJid]);
        await connection.execute('DELETE FROM registraya_whatsapp_message_queue WHERE jid = ?', [targetJid]);

        console.log("✨ Memoria borrada con éxito para este número.");

    } catch (e) {
        console.error("Error BD:", e);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

clearJid();
