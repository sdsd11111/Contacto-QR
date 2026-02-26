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
        const [rows] = await c.execute('SELECT * FROM registraya_vcard_registros WHERE slug = ?', ['multidistribuciones-bzah']);
        const user = rows[0];

        let fullName = '';
        let structuredName = '';
        let organization = '';

        if (user.tipo_perfil === 'negocio') {
            organization = user.nombre_negocio || user.nombre;
            if (user.contacto_nombre || user.contacto_apellido) {
                structuredName = `${user.contacto_apellido || ''};${user.contacto_nombre || ''};;;`;
                const contactFullName = `${user.contacto_nombre || ''} ${user.contacto_apellido || ''}`.trim();
                fullName = `${organization} - ${contactFullName}`;
            } else {
                structuredName = ';;;;';
                fullName = organization;
            }
        }

        console.log('FN:', fullName);
        console.log('N:', structuredName);
        console.log('ORG:', organization);

    } catch (err) {
        console.error(err);
    } finally {
        await c.end();
        process.exit(0);
    }
}

check();
