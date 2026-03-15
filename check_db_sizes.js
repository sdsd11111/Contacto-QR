const mysql = require('mysql2/promise');
require('dotenv').config({path: '.env.local'});
async function run() {
  const c = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await c.execute('SELECT id, slug, LENGTH(catalogo_json) as cat_len, LENGTH(foto_url) as foto_len, LENGTH(portada_desktop) as pd_len FROM registraya_vcard_registros ORDER BY (COALESCE(LENGTH(catalogo_json),0) + COALESCE(LENGTH(foto_url),0)) DESC LIMIT 10');
  console.log(JSON.stringify(rows, null, 2));
  c.end();
}
run().catch(console.error);
