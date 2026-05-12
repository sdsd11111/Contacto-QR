import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
    readFileSync('.env.local', 'utf-8')
        .split('\n')
        .filter(l => l && !l.startsWith('#') && l.includes('='))
        .map(l => {
            const idx = l.indexOf('=');
            return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
        })
);

const pool = await mysql.createConnection({
    host: env.MYSQL_HOST,
    port: parseInt(env.MYSQL_PORT),
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
});

const [rows] = await pool.query('SELECT id, json_override FROM registraya_vcard_registros WHERE json_override IS NOT NULL AND json_override != ""');
let corrupted = 0;

for (const r of rows) {
    try {
        JSON.parse(r.json_override);
    } catch(e) {
        console.log('Corrupted ID:', r.id);
        await pool.query('UPDATE registraya_vcard_registros SET json_override="{}" WHERE id=?', [r.id]);
        corrupted++;
    }
}

console.log('Fixed', corrupted, 'corrupted records.');
await pool.end();
