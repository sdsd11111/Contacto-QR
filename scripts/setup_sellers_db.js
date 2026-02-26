const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

async function setupSellers() {
    console.log('Connecting to MySQL...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        console.log('Creating sellers table...');
        const createSellersTable = `
            CREATE TABLE IF NOT EXISTS registraya_vcard_sellers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'seller',
                comision_porcentaje DECIMAL(5,2) DEFAULT 50.00,
                activo TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `;
        await connection.execute(createSellersTable);
        console.log('Sellers table created.');

        // Initialize with a test seller if not exists
        const testSellerEmail = 'vendedor@test.com';
        const [rows] = await connection.execute('SELECT id FROM registraya_vcard_sellers WHERE email = ?', [testSellerEmail]);

        if (rows.length === 0) {
            console.log('Creating test seller...');
            const insertSeller = `
                INSERT INTO registraya_vcard_sellers (nombre, email, password, role)
                VALUES (?, ?, ?, ?)
            `;
            await connection.execute(insertSeller, ['Vendedor Test', testSellerEmail, 'test1234', 'seller']);
            console.log('Test seller created (email: vendedor@test.com, password: test1234)');
        } else {
            console.log('Test seller already exists.');
        }

    } catch (err) {
        console.error('Error during setup:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

setupSellers();
