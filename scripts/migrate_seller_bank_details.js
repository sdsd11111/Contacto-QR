const mysql = require('mysql2/promise');

require('dotenv').config({ path: '.env.local' });

const dbConfig = {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
};

async function migrateBankDetails() {
    console.log('Connecting to MySQL...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        console.log('Adding bank details columns to registraya_vcard_sellers...');
        const migrateColumns = `
            ALTER TABLE registraya_vcard_sellers 
            ADD COLUMN banco_nombre VARCHAR(255),
            ADD COLUMN banco_beneficiario VARCHAR(255),
            ADD COLUMN banco_numero_cuenta VARCHAR(255),
            ADD COLUMN banco_cedula VARCHAR(255),
            ADD COLUMN banco_correo VARCHAR(255),
            ADD COLUMN datos_bancarios_completados TINYINT(1) DEFAULT 0;
        `;
        await connection.execute(migrateColumns);
        console.log('Columns added successfully.');

    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Columns already exist.');
        } else {
            console.error('Error during migration:', err.message);
        }
    } finally {
        if (connection) await connection.end();
    }
}

migrateBankDetails();
