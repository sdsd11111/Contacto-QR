const mysql = require('mysql2/promise');
const fs = require('fs');

const OLD = { host: 'mysql.us.stackcp.com', port: 42473, user: 'codigosQR-35303938ed5b', password: '5plnsc8lhv', database: 'codigosQR-35303938ed5b', connectTimeout: 15000 };
const NEW = { host: 'mysql.us.stackcp.com', port: 42755, user: 'Activaqrbasededatos-35303936889f', password: 'pwye546gfr', database: 'Activaqrbasededatos-35303936889f', connectTimeout: 15000 };

(async () => {
    const lines = [];
    const log = (s) => { lines.push(s); process.stdout.write(s + '\n'); };

    const o = await mysql.createConnection(OLD);
    const n = await mysql.createConnection(NEW);

    log('VERIFICACION DE MIGRACION');
    const [tbls] = await o.query('SHOW TABLES');
    const k = Object.keys(tbls[0])[0];
    let allOk = true;

    for (const row of tbls) {
        const t = row[k];
        const [[r1]] = await o.query('SELECT COUNT(*) AS c FROM `' + t + '`');
        const [[r2]] = await n.query('SELECT COUNT(*) AS c FROM `' + t + '`');
        const match = Number(r1.c) === Number(r2.c);
        if (!match) allOk = false;
        log((match ? 'OK' : 'DIFF') + '|' + t + '|OLD=' + r1.c + '|NEW=' + r2.c);
    }

    // Slugs
    try {
        const [slugsNew] = await n.query('SELECT slug FROM registraya_vcards ORDER BY id LIMIT 100');
        log('SLUGS_COUNT_NEW=' + slugsNew.length);
        slugsNew.slice(0, 5).forEach(r => log('SLUG|' + r.slug));
    } catch (e) { log('SLUG_ERR|' + e.message); }

    log('RESULT=' + (allOk ? 'PERFECTO' : 'HAY_DIFERENCIAS'));

    fs.writeFileSync('scripts/verification_result.txt', lines.join('\n'), 'utf8');
    await o.end(); await n.end();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
