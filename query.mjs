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
            'SELECT instagram, facebook, linkedin, tiktok, youtube, x, json_override FROM registraya_vcard_registros WHERE slug = ?',
            ['litos-ink-vape-urban-shop-zg5z']
        );
        console.log(JSON.stringify(rows[0], null, 2));
    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await connection.end();
    }
}
run();
