const mysql = require('mysql2/promise');

const NEW = { host: 'mysql.us.stackcp.com', port: 42755, user: 'Activaqrbasededatos-35303936889f', password: 'pwye546gfr', database: 'Activaqrbasededatos-35303936889f', connectTimeout: 15000 };

(async () => {
    const c = await mysql.createConnection(NEW);

    // 1. Total filas
    const [[{ total }]] = await c.query('SELECT COUNT(*) AS total FROM registraya_vcard_registros');
    console.log('Total filas en registros:', total);

    // 2. Distribución de status
    const [statusRows] = await c.query('SELECT status, COUNT(*) AS count FROM registraya_vcard_registros GROUP BY status ORDER BY count DESC');
    console.log('\nDistribución por status:');
    statusRows.forEach(r => console.log('  status="' + r.status + '" -> ' + r.count + ' filas'));

    // 3. ¿Cuántos con status pagado o entregado?
    const [[{ pagados }]] = await c.query("SELECT COUNT(*) AS pagados FROM registraya_vcard_registros WHERE status IN ('pagado','entregado')");
    console.log('\nTotal status pagado/entregado:', pagados);

    // 4. Muestra de status únicos
    const [allStatus] = await c.query('SELECT DISTINCT status FROM registraya_vcard_registros');
    console.log('\nValores únicos de status:', allStatus.map(r => r.status));

    // 5. Sellers registrados
    const [[{ sellers }]] = await c.query('SELECT COUNT(*) AS sellers FROM registraya_vcard_sellers');
    console.log('\nTotal sellers:', sellers);

    await c.end();
})().catch(e => console.error('ERROR:', e.message));
