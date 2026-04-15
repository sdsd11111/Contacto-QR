const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

async function assignToCesar() {
    console.log('Connecting to MySQL...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        // 1. Ensure Cesar Reyes exists
        const cesarEmail = 'objetivo.cesar@gmail.com';
        const [rows] = await connection.execute('SELECT id FROM registraya_vcard_sellers WHERE email = ?', [cesarEmail]);

        let cesarId;
        if (rows.length === 0) {
            console.log('Creating Cesar Reyes seller...');
            const [result] = await connection.execute(
                'INSERT INTO registraya_vcard_sellers (nombre, email, password, role) VALUES (?, ?, ?, ?)',
                ['Cesar Reyes', cesarEmail, 'cesar2026', 'seller']
            );
            cesarId = result.insertId;
            console.log(`Cesar Reyes created with ID: ${cesarId}`);
        } else {
            cesarId = rows[0].id;
            console.log(`Cesar Reyes already exists with ID: ${cesarId}`);
        }

        // 2. Assign ALL current records to Cesar
        console.log('Assigning all existing registrations to Cesar Reyes...');
        const [updateResult] = await connection.execute(
            'UPDATE registraya_vcard_registros SET seller_id = ? WHERE seller_id IS NULL',
            [cesarId]
        );
        console.log(`Updated ${updateResult.affectedRows} records.`);

    } catch (err) {
        console.error('Error in script:');
        console.error(err.stack);
    } finally {
        if (connection) await connection.end();
    }
}

assignToCesar();
