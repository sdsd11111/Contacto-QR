import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env.local') });
config({ path: path.join(__dirname, '..', '.env') });

async function main() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    const [rows] = await pool.execute(
        `SELECT slug, nombre, plan, productos_servicios, catalogo_json, json_override 
         FROM registraya_vcard_registros 
         WHERE slug LIKE '%marqueteria%' OR nombre LIKE '%Marqueter%'`
    );

    if (rows.length === 0) {
        console.log('No se encontró "Marquetería Loja". Buscando otro con plan catalogo...');
        const [alt] = await pool.execute(
            `SELECT slug, nombre, plan FROM registraya_vcard_registros WHERE plan = 'catalogo' LIMIT 5`
        );
        console.log(JSON.stringify(alt, null, 2));
        await pool.end();
        return;
    }

    const r = rows[0];
    console.log('Registro:', r.nombre, `(${r.slug})`, '| Plan:', r.plan);

    console.log('\n--- productos_servicios ---');
    console.log(r.productos_servicios);

    let override = {};
    try { override = typeof r.json_override === 'string' ? JSON.parse(r.json_override || '{}') : (r.json_override || {}); } catch {}
    console.log('\n--- json_override.experienceTitles ---');
    console.log(JSON.stringify(override.experienceTitles || [], null, 2));

    let catalogo = {};
    try { catalogo = typeof r.catalogo_json === 'string' ? JSON.parse(r.catalogo_json || '{}') : (r.catalogo_json || {}); } catch {}
    console.log('\n--- catalogo_json.categories ---');
    console.log(JSON.stringify(catalogo.categories || [], null, 2));
    console.log('\n--- catalogo_json.products (cantidad) ---');
    console.log((catalogo.products || []).length, 'productos');

    const lines = r.productos_servicios.split('\n').map(l => l.trim()).filter(Boolean);
    const titles = override.experienceTitles || [];
    const visibleNames = lines.map((line, i) => {
        const t = titles.find(t => t.index === i);
        return t?.title || line;
    });
    console.log('\n--- Nombres VISIBLES en experiencia ---');
    console.log(JSON.stringify(visibleNames));

    console.log('\n--- ¿Coinciden? ---');
    const dbCats = catalogo.categories || [];
    const missing = visibleNames.filter(v => !dbCats.includes(v));
    const extra = dbCats.filter(c => !visibleNames.includes(c) && c !== 'Nueva Categoría');
    if (missing.length === 0) console.log('✅ Todas las categorías de experiencia están en el catálogo');
    else console.log('❌ Faltan en catálogo:', missing);
    if (extra.length > 0) console.log('ℹ️  Extras en catálogo (no están en experiencia):', extra);

    await pool.end();
}

main().catch(e => console.error('ERROR:', e));
