
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: Number(process.env.MYSQL_PORT) || 3306,
    });

    try {
        console.log('Adding youtube_video_url column...');
        await connection.execute('ALTER TABLE registraya_vcard_registros ADD COLUMN youtube_video_url TEXT AFTER youtube;');
        console.log('Success!');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column already exists.');
        } else {
            console.error('Error:', err);
            process.exit(1);
        }
    } finally {
        await connection.end();
    }
}

migrate();
