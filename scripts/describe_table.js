const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const config = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: Number(process.env.MYSQL_PORT) || 3306,
    };

    const c = await mysql.createConnection(config);
    try {
        console.log('Describing Table Schema (Full)...');
        const [rows] = await c.execute('DESCRIBE registraya_vcard_registros');
        console.log(JSON.stringify(rows, null, 2));

        // Also check if there are any triggers (though mysql2 might not show them easily)
        console.log('Checking Triggers...');
        const [triggers] = await c.execute('SHOW TRIGGERS LIKE "registraya_vcard_registros"');
        console.log(JSON.stringify(triggers, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await c.end();
        process.exit(0);
    }
}

check();
