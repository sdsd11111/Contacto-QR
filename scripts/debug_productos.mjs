import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env.local') });
config({ path: path.join(__dirname, '..', '.env') });

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

const [rows] = await pool.execute("SELECT catalogo_json FROM registraya_vcard_registros WHERE slug = 'marquetera-loja'");
const r = rows[0];
let cat = typeof r.catalogo_json === 'string' ? JSON.parse(r.catalogo_json) : r.catalogo_json;

console.log('Categorías:', JSON.stringify(cat.categories));
console.log('Total productos:', cat.products.length);

cat.products.forEach((p, i) => {
    console.log('\nProducto', i + 1 + ':', p.nombre || p.name);
    console.log('  imágenes:', JSON.stringify(p.imagenes || (p.image ? [p.image] : [])));
    console.log('  videos:', JSON.stringify(p.videos || (p.video ? [p.video] : [])));
    console.log('  precio:', p.precio || p.price);
});

await pool.end();
