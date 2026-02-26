const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function fix() {
    const config = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: Number(process.env.MYSQL_PORT) || 3306,
    };

    const c = await mysql.createConnection(config);
    try {
        // Step 1: Show current state
        const [before] = await c.execute(`
            SELECT commission_status, COUNT(*) as count 
            FROM registraya_vcard_registros 
            GROUP BY commission_status
        `);
        console.log('BEFORE - Commission Status Distribution:');
        console.log(JSON.stringify(before, null, 2));

        // Step 2: Reset ALL commission_status to 'pending'
        // The admin can then manually mark as paid the ones that are truly paid
        const [result] = await c.execute(`
            UPDATE registraya_vcard_registros 
            SET commission_status = 'pending' 
            WHERE commission_status = 'paid'
        `);
        console.log('\nReset Result:', JSON.stringify(result));

        // Step 3: Verify
        const [after] = await c.execute(`
            SELECT commission_status, COUNT(*) as count 
            FROM registraya_vcard_registros 
            GROUP BY commission_status
        `);
        console.log('\nAFTER - Commission Status Distribution:');
        console.log(JSON.stringify(after, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await c.end();
        process.exit(0);
    }
}

fix();
