const mysql = require('mysql2/promise');

const cfg = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

async function verify() {
    const c = await mysql.createConnection(cfg);

    // 1. Correos pendientes restantes
    const [emails] = await c.execute('SELECT COUNT(*) as total FROM registraya_vcard_registros WHERE auto_email_sent = 0 OR auto_email_sent IS NULL');
    process.stdout.write('Correos pendientes restantes: ' + emails[0].total + '\n');

    // 2. Cesar - role, comision, commission_status
    const [cesar] = await c.execute('SELECT id, nombre, codigo, role, comision_porcentaje FROM registraya_vcard_sellers WHERE id = 11');
    process.stdout.write('Cesar: ' + JSON.stringify(cesar[0]) + '\n');

    // 3. Comisiones pendientes de Cesar
    const [comm] = await c.execute("SELECT COUNT(*) as total FROM registraya_vcard_registros WHERE seller_id = 11 AND commission_status != 'paid'");
    process.stdout.write('Comisiones pendientes de Cesar: ' + comm[0].total + '\n');

    await c.end();
}

verify().catch(e => process.stdout.write('ERR: ' + e.message + '\n'));
