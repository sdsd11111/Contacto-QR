import mysql from 'mysql2/promise';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

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

async function run() {
    console.log("Searching for ActivaQR profile...");
    const [rows] = await pool.execute("SELECT * FROM registraya_vcard_registros WHERE nombre LIKE '%Activa%' OR nombre LIKE '%César%' OR email LIKE '%activaqr%'");
    console.log(JSON.stringify(rows, null, 2));
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
