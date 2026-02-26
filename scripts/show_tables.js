const mysql = require('mysql2/promise');
const fs = require('fs');
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
        const [rows] = await c.execute('SHOW TABLES');
        const tableNames = rows.map(r => Object.values(r)[0]);
        fs.writeFileSync('scripts/tables.json', JSON.stringify(tableNames, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await c.end();
        process.exit(0);
    }
}
check();
