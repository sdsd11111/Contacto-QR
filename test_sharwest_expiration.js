const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function test() {
    const config = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: Number(process.env.MYSQL_PORT) || 3306,
    };

    const c = await mysql.createConnection(config);
    try {
        const sharwestId = 'eb6d9979-b284-4140-a614-b32e8ca902ac';
        
        console.log('--- Step 1: Setting Sharwest to EXPIRED (yesterday) ---');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        await c.execute(`
            UPDATE registraya_vcard_registros 
            SET expires_at = ?, status = 'entregado' 
            WHERE id = ?
        `, [yesterday, sharwestId]);
        
        console.log('Sharwest is now set to expire yesterday and status "entregado".');

        console.log('--- Step 2: Running expiration check logic (CRON simulation) ---');
        const [expired] = await c.execute(`
            SELECT id, nombre, status FROM registraya_vcard_registros 
            WHERE expires_at < NOW() AND status != 'cancelado' AND id = ?
        `, [sharwestId]);

        if (expired.length > 0) {
            console.log(`Found ${expired.length} records to cancel (including Sharwest).`);
            await c.execute(`
                UPDATE registraya_vcard_registros 
                SET status = 'cancelado' 
                WHERE id = ?
            `, [sharwestId]);
            console.log('Sharwest status updated to "cancelado". BLOCKING SUCCESSFUL.');
        } else {
            console.log('No expired records found. Something is wrong.');
        }

        console.log('--- Step 3: Setting Sharwest to expire TOMORROW as requested ---');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        await c.execute(`
            UPDATE registraya_vcard_registros 
            SET expires_at = ?, status = 'entregado', activation_type = 'annual' 
            WHERE id = ?
        `, [tomorrow, sharwestId]);
        
        const [final] = await c.execute('SELECT id, nombre, status, expires_at FROM registraya_vcard_registros WHERE id = ?', [sharwestId]);
        console.log('Final State for Sharwest:', JSON.stringify(final[0], null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await c.end();
        process.exit(0);
    }
}

test();
