
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
        const [rows] = await connection.execute('DESCRIBE registraya_vcard_registros');
        const planCol = rows.find(r => r.Field === 'plan');
        if (planCol) {
            console.log("PLAN_COLUMN_EXISTS: YES");
        } else {
            console.log("PLAN_COLUMN_EXISTS: NO");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

check();
