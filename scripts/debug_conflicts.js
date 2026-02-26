const mysql = require('mysql2/promise');

async function debug() {
    const ids = [
        'df768484-6146-4051-9bbb-30a7741344c8',
        '23a3ea0d-a35b-4acb-a8a0-bba036546313'
    ];
    const emails = [
        'fornodifango@hotmail.com',
        'cristhopheryeah113@gmail.com'
    ];

    const c = await mysql.createConnection({
        host: 'mysql.us.stackcp.com',
        port: 42755,
        user: 'Activaqrbasededatos-35303936889f',
        password: 'pwye546gfr',
        database: 'Activaqrbasededatos-35303936889f'
    });

    console.log('--- REVISANDO CONFLICTOS EN MYSQL ---');

    const [rows] = await c.query(
        'SELECT id, slug, email, nombre FROM registraya_vcard_registros WHERE id IN (?) OR email IN (?)',
        [ids, emails]
    );

    console.log(JSON.stringify(rows, null, 2));
    await c.end();
}

debug().catch(console.error);
