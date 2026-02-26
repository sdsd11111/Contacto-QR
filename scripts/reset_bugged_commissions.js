const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function reset() {
    const config = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: Number(process.env.MYSQL_PORT) || 3306,
    };

    const c = await mysql.createConnection(config);
    try {
        console.log('Resetting commission_status to pending for records that are not yet pagado/entregado...');
        const [result] = await c.execute(`
            UPDATE registraya_vcard_registros 
            SET commission_status = 'pending' 
            WHERE status NOT IN ('pagado', 'entregado') AND commission_status = 'paid'
        `);
        console.log(`Reset ${result.affectedRows} records.`);
    } catch (err) {
        console.error(err);
    } finally {
        await c.end();
        process.exit(0);
    }
}

reset();
