import pool from '../lib/db';

async function check() {
    try {
        const [sessions] = await pool.query('SELECT jid, last_interaction, bot_muted_until, last_human_interaction FROM registraya_whatsapp_sessions ORDER BY last_interaction DESC LIMIT 5');
        console.log("Recent sessions:");
        console.table(sessions);

        const [messages] = await pool.query('SELECT role, content, created_at FROM registraya_whatsapp_messages ORDER BY created_at DESC LIMIT 5');
        console.log("Recent messages:");
        console.table(messages);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
