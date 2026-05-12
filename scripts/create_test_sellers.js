const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

async function createTestSellers() {
    console.log('Connecting to MySQL...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        const testSellers = [
            { nombre: 'Juan Perez', email: 'juan@vendedor.com', password: 'juan123', comision: 30 },
            { nombre: 'Maria Garcia', email: 'maria@vendedor.com', password: 'maria123', comision: 40 }
        ];

        for (const s of testSellers) {
            console.log(`Checking if ${s.nombre} exists...`);
            const [rows] = await connection.execute('SELECT id FROM registraya_vcard_sellers WHERE email = ?', [s.email]);

            if (rows.length === 0) {
                console.log(`Creating seller: ${s.nombre}`);
                await connection.execute(
                    'INSERT INTO registraya_vcard_sellers (nombre, email, password, role, comision_porcentaje) VALUES (?, ?, ?, ?, ?)',
                    [s.nombre, s.email, s.password, 'seller', s.comision]
                );
                console.log(`Seller ${s.nombre} created.`);
            } else {
                console.log(`Seller ${s.nombre} already exists.`);
            }
        }

        console.log('\n--- Final Sellers List ---');
        const [sellers] = await connection.execute('SELECT id, nombre, email, comision_porcentaje FROM registraya_vcard_sellers');
        console.table(sellers);

    } catch (err) {
        console.error('Error in script:', err.stack);
    } finally {
        if (connection) await connection.end();
    }
}

createTestSellers();
