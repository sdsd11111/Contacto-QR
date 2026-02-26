const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const dbConfig = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

async function testInsert() {
    console.log('Connecting to MySQL...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        const newId = uuidv4();
        const now = new Date();
        const email = `test_${Date.now()}@example.com`;

        const insertQuery = `
            INSERT INTO registraya_vcard_registros (
                id, created_at, nombre, email, whatsapp, profesion, empresa, bio, direccion,
                web, google_business, instagram, linkedin, facebook, tiktok, productos_servicios,
                plan, foto_url, comprobante_url, galeria_urls, status, slug, etiquetas,
                commission_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

        const values = [
            newId, now, 'Test User Antigravity', email, '123456789', 'Tester', 'Antigravity AI', 'Bio test', 'Address test',
            'http://test.com', 'http://gb.com', 'insta', 'linke', 'face', 'tik', 'prod',
            'pro', 'http://photo.com', 'http://receipt.com', '[]', 'pendiente', 'test-slug-' + Date.now(), 'Test, AI'
        ];

        console.log('Executing INSERT...');
        const [result] = await connection.execute(insertQuery, values);
        console.log('Insert successful! ID:', newId);
        console.log('Affected rows:', result.affectedRows);

    } catch (err) {
        console.error('Error during test insert:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

testInsert();
