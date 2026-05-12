require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        await conn.execute('ALTER TABLE registraya_vcard_registros ADD COLUMN google_rating VARCHAR(10) DEFAULT NULL');
        console.log('google_rating column added');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('google_rating already exists');
        else console.error('Error:', e.message);
    }

    try {
        await conn.execute('ALTER TABLE registraya_vcard_registros ADD COLUMN google_reviews_count VARCHAR(10) DEFAULT NULL');
        console.log('google_reviews_count column added');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('google_reviews_count already exists');
        else console.error('Error:', e.message);
    }

    await conn.end();
    console.log('Migration complete!');
    process.exit(0);
})();
