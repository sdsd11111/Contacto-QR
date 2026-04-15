const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

async function getCesarCreds() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT nombre, email, password, codigo FROM registraya_vcard_sellers WHERE email = ?',
            ['objetivo.cesar@gmail.com']
        );
        console.table(rows);
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) await connection.end();
    }
}

getCesarCreds();
