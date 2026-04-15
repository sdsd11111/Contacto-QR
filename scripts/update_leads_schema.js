const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function updateSchema() {
    const dbConfig = {
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    };

    const connection = await mysql.createConnection(dbConfig);
    try {
        console.log('Adding provincia and canton columns...');
        await connection.execute('ALTER TABLE ventas_leads ADD COLUMN provincia VARCHAR(100) AFTER celular');
        await connection.execute('ALTER TABLE ventas_leads ADD COLUMN canton VARCHAR(100) AFTER provincia');
        console.log('Columns added successfully.');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Columns already exist.');
        } else {
            console.error('Error:', err.message);
        }
    } finally {
        await connection.end();
    }
}

updateSchema();
