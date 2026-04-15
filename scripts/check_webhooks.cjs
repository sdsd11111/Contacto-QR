require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: parseInt(process.env.MYSQL_PORT || '3306')
    });

    try {
        console.log("Connected to DB");

        const [sessions] = await connection.execute('SELECT jid, last_interaction, bot_muted_until, last_human_interaction FROM registraya_whatsapp_sessions ORDER BY last_interaction DESC LIMIT 3');
        console.log("--- LATEST SESSIONS ---");
        console.table(sessions);

        const [msgs] = await connection.execute('SELECT jid, role, content, created_at FROM registraya_whatsapp_messages ORDER BY created_at DESC LIMIT 5');
        console.log("--- LATEST MESSAGES ---");
        console.table(msgs);

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}
check();
