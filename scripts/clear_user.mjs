import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually
const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
}

const pool = await mysql.createPool({
    host: env.MYSQL_HOST,
    port: Number(env.MYSQL_PORT),
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    connectTimeout: 30000,
});

const jid = '593963410409@s.whatsapp.net';
console.log(`Clearing data for JID: ${jid}`);

const [m] = await pool.execute('DELETE FROM registraya_whatsapp_messages WHERE jid = ?', [jid]);
console.log(`Messages deleted: ${m.affectedRows}`);
const [l] = await pool.execute('DELETE FROM registraya_whatsapp_leads WHERE jid = ?', [jid]);
console.log(`Leads deleted: ${l.affectedRows}`);
const [s] = await pool.execute('DELETE FROM registraya_whatsapp_sessions WHERE jid = ?', [jid]);
console.log(`Sessions deleted: ${s.affectedRows}`);

console.log('✅ Done! History cleared.');
await pool.end();
process.exit(0);
