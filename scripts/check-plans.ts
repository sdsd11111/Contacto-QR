import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        const [rows] = await pool.execute('SELECT plan, count(*) as count FROM registraya_vcard_registros GROUP BY plan');
        console.log('Plan counts:', rows);

        const [proDigital] = await pool.execute('SELECT id, nombre, plan FROM registraya_vcard_registros WHERE plan IN ("pro", "digital", "basic") LIMIT 20');
        console.log('Sample records (pro/digital/basic):', proDigital);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();
