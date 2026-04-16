import mysql from 'mysql2/promise';
import { config } from 'dotenv';
config({ path: '.env' });

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        const [rows] = await connection.execute(
            'SELECT slug, plan, nombre FROM registraya_vcard_registros WHERE slug IN (?, ?)',
            ['activaqr-9ag4', 'luce-bella-0lrf']
        );
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await connection.end();
    }
}
run();
