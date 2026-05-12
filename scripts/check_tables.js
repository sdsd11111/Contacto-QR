const mysql = require('mysql2/promise');

const cfg = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

async function run() {
    const c = await mysql.createConnection(cfg);

    // ===== TAREA 1: Marcar correos como enviados =====
    // Buscar tabla de email queue
    const [tabs] = await c.execute('SHOW TABLES');
    const tableNames = tabs.map(t => Object.values(t)[0]);
    const emailTable = tableNames.find(t => t.toLowerCase().includes('email') || t.toLowerCase().includes('mail') || t.toLowerCase().includes('queue') || t.toLowerCase().includes('correo'));

    process.stdout.write('Tablas: ' + tableNames.join(', ') + '\n');
    process.stdout.write('Tabla email detectada: ' + emailTable + '\n');

    if (emailTable) {
        // Ver columnas de la tabla email
        const [cols] = await c.execute('SHOW COLUMNS FROM ' + emailTable);
        process.stdout.write('Columnas email: ' + cols.map(x => x.Field).join(', ') + '\n');

        // Contar pendientes
        const [count] = await c.execute('SELECT COUNT(*) as total FROM ' + emailTable);
        process.stdout.write('Total en cola: ' + count[0].total + '\n');
    } else {
        // Buscar en registros el campo auto_email_sent
        const [counts] = await c.execute('SELECT auto_email_sent, COUNT(*) as total FROM registraya_vcard_registros GROUP BY auto_email_sent');
        process.stdout.write('auto_email_sent status: ' + JSON.stringify(counts) + '\n');
    }

    // ===== TAREA 2: Ver columnas de sellers para Cesar =====
    const [sellerCols] = await c.execute('SHOW COLUMNS FROM registraya_vcard_sellers');
    process.stdout.write('\nColumnas sellers: ' + sellerCols.map(x => x.Field).join(', ') + '\n');

    const [cesar] = await c.execute('SELECT * FROM registraya_vcard_sellers WHERE id = 11');
    process.stdout.write('Cesar completo: ' + JSON.stringify(cesar[0]) + '\n');

    await c.end();
}

run().catch(e => process.stdout.write('ERR: ' + e.message + '\n'));
