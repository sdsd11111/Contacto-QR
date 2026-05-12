import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function checkAndClear() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT || 3306),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        console.log("--- CHEQUEO DE CHATS DORMIDOS ---");
        const [queue] = await connection.execute(
            'SELECT jid, COUNT(*) as pending_messages, MAX(created_at) as last_message FROM registraya_whatsapp_message_queue WHERE processed = 0 GROUP BY jid'
        );

        if (queue.length > 0) {
            console.log("⚠️ Chats pendientes en la cola (DORMIDOS):", queue);
        } else {
            console.log("✅ No hay chats dormidos en la cola.");
        }

        const [history] = await connection.execute('SELECT COUNT(*) as total FROM registraya_whatsapp_history');
        console.log(`Total historial:`, history[0].total);

        const [leads] = await connection.execute('SELECT COUNT(*) as total FROM registraya_whatsapp_leads');
        console.log(`Total leads:`, leads[0].total);

        console.log("Borrando memoria...");
        await connection.execute('DELETE FROM registraya_whatsapp_history');
        await connection.execute('DELETE FROM registraya_whatsapp_leads');
        await connection.execute('DELETE FROM registraya_whatsapp_sessions');
        await connection.execute('DELETE FROM registraya_whatsapp_message_queue');

        console.log("✨ Memoria del bot, historiales y contextos borrados con éxito.");

    } catch (e) {
        console.error("Error BD:", e);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

checkAndClear();
