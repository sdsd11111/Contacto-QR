
const mysql = require('mysql2/promise');

async function check() {
    const connection = await mysql.createConnection({
        host: 'mysql.us.stackcp.com',
        port: 42755,
        user: 'Activaqrbasededatos-35303936889f',
        password: 'pwye546gfr',
        database: 'Activaqrbasededatos-35303936889f'
    });

    try {
        const [rows] = await connection.execute('SELECT activation_type FROM registraya_vcard_registros LIMIT 10');
        console.log("Data:", JSON.stringify(rows));
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

check();
