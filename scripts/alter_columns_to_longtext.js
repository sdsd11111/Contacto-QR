const mysql = require('mysql2/promise');

// MySQL Credentials
const dbConfig = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

async function modifyColumns() {
    console.log('Connecting to MySQL...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        console.log('Modifying columns to LONGTEXT to store Base64 images...');

        // foto_url -> LONGTEXT
        await connection.execute(`
            ALTER TABLE registraya_vcard_registros
            MODIFY COLUMN foto_url LONGTEXT;
        `);
        console.log('foto_url modified to LONGTEXT.');

        // comprobante_url -> LONGTEXT
        await connection.execute(`
            ALTER TABLE registraya_vcard_registros
            MODIFY COLUMN comprobante_url LONGTEXT;
        `);
        console.log('comprobante_url modified to LONGTEXT.');

    } catch (err) {
        console.error('Error modifying columns:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

modifyColumns();
