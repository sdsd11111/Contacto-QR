const mysql = require('mysql2/promise');

// MySQL Credentials
const dbConfig = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

async function addUniqueConstraint() {
    console.log('Connecting to MySQL...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        console.log('Adding UNIQUE constraint to email...');
        // We use IGNORE or check duplicates first? 
        // For now, straightforward ALTER. If duplicates exist, it will fail.
        await connection.execute(`
            ALTER TABLE registraya_vcard_registros
            ADD UNIQUE INDEX idx_email (email);
        `);
        console.log('UNIQUE constraint added to email.');

    } catch (err) {
        console.error('Error adding constraint:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

addUniqueConstraint();
