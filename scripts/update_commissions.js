const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

async function updateCommissions() {
    console.log('Connecting to MySQL...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        console.log('Updating all sellers commissions to 50%...');
        const [result] = await connection.execute(
            'UPDATE registraya_vcard_sellers SET comision_porcentaje = 50'
        );
        console.log(`Updated ${result.affectedRows} sellers.`);

        console.log('\n--- Final Sellers List ---');
        const [sellers] = await connection.execute('SELECT id, nombre, email, comision_porcentaje FROM registraya_vcard_sellers');
        console.table(sellers);

    } catch (err) {
        console.error('Error in script:', err.stack);
    } finally {
        if (connection) await connection.end();
    }
}

updateCommissions();
