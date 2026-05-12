const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const config = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: Number(process.env.MYSQL_PORT) || 3306
    };

    console.log('Connecting to:', config.host, config.database);

    const connection = await mysql.createConnection(config);
    try {
        const [rows] = await connection.execute('DESCRIBE registraya_vcard_registros');
        console.log('Columns in registraya_vcard_registros:');
        rows.forEach(row => {
            console.log(`- ${row.Field} (${row.Type})`);
        });

        const commissionStatusExists = rows.some(r => r.Field === 'commission_status');
        if (!commissionStatusExists) {
            console.log('\nWARNING: commission_status column is MISSING!');
            console.log('Attempting to add it...');
            await connection.execute('ALTER TABLE registraya_vcard_registros ADD COLUMN commission_status VARCHAR(20) DEFAULT "pending"');
            console.log('Column commission_status added successfully.');
        } else {
            console.log('\nColumn commission_status already exists.');
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

check();
