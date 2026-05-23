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

    // Buscar un registro cualquiera con plan catalogo que tenga productos_servicios
    const [rows] = await pool.execute(
        `SELECT id, slug, nombre, plan, productos_servicios, catalogo_json, json_override 
         FROM registraya_vcard_registros 
         WHERE plan IN ('catalogo','business') 
         AND productos_servicios IS NOT NULL 
         AND productos_servicios != ''
         LIMIT 3`
    );

    for (const r of rows) {
        console.log('\n==========', r.nombre, `(${r.slug})`, '| Plan:', r.plan);
        console.log('--- productos_servicios (raw):');
        console.log(r.productos_servicios);

        let override = {};
        try { override = typeof r.json_override === 'string' ? JSON.parse(r.json_override || '{}') : (r.json_override || {}); } catch {}

        console.log('--- json_override.experienceTitles:');
        console.log(JSON.stringify(override.experienceTitles || []));

        let catalogo = {};
        try { catalogo = typeof r.catalogo_json === 'string' ? JSON.parse(r.catalogo_json || '{}') : (r.catalogo_json || {}); } catch {}
        console.log('--- catalogo_json.categories:');
        console.log(JSON.stringify(catalogo.categories || []));

        // ¿Qué DEBERÍA tener?
        const lines = r.productos_servicios.split('\n').map(l => l.trim()).filter(Boolean);
        const titles = override.experienceTitles || [];
        const visibleNames = lines.map((line, i) => {
            const t = titles.find(t => t.index === i);
            return t?.title || line;
        });
        console.log('--- Nombres VISIBLES en experiencia:');
        console.log(JSON.stringify(visibleNames));
    }

    await pool.end();
}

main().catch(e => console.error('ERROR:', e));
