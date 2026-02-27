const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function run() {
    console.log('Connecting to database...');
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });
        console.log('Connected to database.');
    } catch (err) {
        console.error('Failed to connect to database:', err);
        return;
    }

    try {
        console.log('--- Altering registraya_vcard_field_visits to allow NULL business_name ---');
        await conn.execute(`
            ALTER TABLE registraya_vcard_field_visits 
            MODIFY COLUMN business_name VARCHAR(200) NULL;
        `);
        console.log('✅ Column business_name is now nullable.');

    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await conn.end();
    }
}

run();
