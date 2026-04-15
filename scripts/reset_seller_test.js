const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function reset() {
    const config = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: Number(process.env.MYSQL_PORT)
    };

    const c = await mysql.createConnection(config);
    try {
        await c.execute("UPDATE registraya_vcard_sellers SET terminos_aceptados_en = NULL, datos_bancarios_completados = 0 WHERE email = 'cristhopheryeah113@gmail.com'");
        console.log('Reset successful for testing');
    } catch (err) {
        console.error(err);
    } finally {
        await c.end();
    }
}

reset();
