const mysql = require('mysql2/promise');

async function run() {
    const conn = await mysql.createConnection({
        host: 'mysql.us.stackcp.com',
        port: 42473,
        user: 'codigosQR-35303938ed5b',
        password: '5plnsc8lhv',
        database: 'codigosQR-35303938ed5b'
    });

    try {
        // STEP 1: Describe tables
        console.log('=== SCHEMA: registraya_vcard_registros ===');
        const [regCols] = await conn.execute('DESCRIBE registraya_vcard_registros');
        regCols.forEach(c => console.log(`  ${c.Field} (${c.Type}) ${c.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${c.Key || ''} default=${c.Default}`));

        console.log('\n=== SCHEMA: registraya_vcard_sellers ===');
        const [selCols] = await conn.execute('DESCRIBE registraya_vcard_sellers');
        selCols.forEach(c => console.log(`  ${c.Field} (${c.Type}) ${c.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${c.Key || ''} default=${c.Default}`));

        // STEP 2: Show existing sellers
        console.log('\n=== EXISTING SELLERS ===');
        const [sellers] = await conn.execute('SELECT * FROM registraya_vcard_sellers');
        console.table(sellers);

        // STEP 3: Show sample registros to see seller-related columns
        console.log('\n=== SAMPLE REGISTROS (first 5) ===');
        const [regs] = await conn.execute('SELECT id, name, email, seller_id, email_sent, paid_at FROM registraya_vcard_registros LIMIT 5');
        console.table(regs);

    } catch (error) {
        console.error('Error:', error.message);

        // If seller_id fails, try without it
        if (error.message.includes('seller_id')) {
            console.log('\nRetrying without seller_id...');
            const [regs] = await conn.execute('SELECT id, name, email, email_sent FROM registraya_vcard_registros LIMIT 5');
            console.table(regs);
        }
    } finally {
        await conn.end();
    }
}

run();
