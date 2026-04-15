import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function muteNumbers() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 5,
    });

    const numbers = [
        '593996847682@s.whatsapp.net',
        '5218122138778@s.whatsapp.net',
        '528122138778@s.whatsapp.net' // in case WhatsApp drops the 1 for mexico
    ];

    const mutedUntil = new Date(Date.now() + 30 * 60 * 60 * 1000); // 30 hours from now

    try {
        for (const jid of numbers) {
            await pool.execute(
                `INSERT INTO registraya_whatsapp_sessions (jid, last_human_interaction, bot_muted_until) 
                 VALUES (?, NOW(), ?) 
                 ON DUPLICATE KEY UPDATE bot_muted_until = ?`,
                [jid, mutedUntil, mutedUntil]
            );
            console.log(`Muted bot for ${jid} until ${mutedUntil.toISOString()}`);
        }
    } catch (error) {
        console.error("Error updating DB:", error);
    } finally {
        await pool.end();
    }
}

muteNumbers();
