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
        console.log('--- Migrating registraya_vcard_field_visits ---');

        // Check if columns already exist to avoid errors
        const [columns] = await conn.execute(`SHOW COLUMNS FROM registraya_vcard_field_visits`);
        const existingColumns = columns.map(c => c.Field);

        if (!existingColumns.includes('contact_phone')) {
            await conn.execute(`ALTER TABLE registraya_vcard_field_visits ADD COLUMN contact_phone VARCHAR(50) AFTER contact_name`);
            console.log('✅ Added contact_phone');
        }
        if (!existingColumns.includes('contact_email')) {
            await conn.execute(`ALTER TABLE registraya_vcard_field_visits ADD COLUMN contact_email VARCHAR(255) AFTER contact_phone`);
            console.log('✅ Added contact_email');
        }
        if (!existingColumns.includes('contact_cedula')) {
            await conn.execute(`ALTER TABLE registraya_vcard_field_visits ADD COLUMN contact_cedula VARCHAR(20) AFTER contact_email`);
            console.log('✅ Added contact_cedula');
        }

        console.log('--- Adding attributed_by_footprint to registraya_vcard_registros ---');
        const [regColumns] = await conn.execute(`SHOW COLUMNS FROM registraya_vcard_registros`);
        const existingRegColumns = regColumns.map(c => c.Field);

        if (!existingRegColumns.includes('attributed_by_footprint')) {
            await conn.execute(`ALTER TABLE registraya_vcard_registros ADD COLUMN attributed_by_footprint TINYINT(1) DEFAULT 0 AFTER seller_id`);
            console.log('✅ Added attributed_by_footprint to registrations');
        }

        console.log('Migration completed successfully.');

    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await conn.end();
    }
}

run();
