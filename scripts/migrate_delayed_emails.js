const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    console.log('Connected to MySQL. Starting migration...');

    try {
        // Add paid_at
        try {
            await connection.execute('ALTER TABLE registraya_vcard_registros ADD COLUMN paid_at TIMESTAMP NULL AFTER status');
            console.log('Column paid_at added.');
        } catch (e) {
            console.log('Column paid_at might already exist or error:', e.message);
        }

        // Add auto_email_sent
        try {
            await connection.execute('ALTER TABLE registraya_vcard_registros ADD COLUMN auto_email_sent TINYINT(1) DEFAULT 0 AFTER paid_at');
            console.log('Column auto_email_sent added.');
        } catch (e) {
            console.log('Column auto_email_sent might already exist or error:', e.message);
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
