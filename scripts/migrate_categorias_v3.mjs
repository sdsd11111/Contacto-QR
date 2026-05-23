/**
 * v3: Para registros con plan EXACTO 'catalog' (sin o) o 'business'
 * Sincroniza los nombres VISIBLES de experiencia al catalogo_json.categories
 */
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
        `SELECT id, slug, nombre, plan, productos_servicios, catalogo_json, json_override 
         FROM registraya_vcard_registros 
         WHERE plan IN ('catalog','catalogo','business') 
         AND productos_servicios IS NOT NULL 
         AND productos_servicios != ''`
    );

    console.log('Registros:', rows.length);
    let count = 0;

    for (const r of rows) {
        const lines = r.productos_servicios.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) continue;

        let override = {};
        try { override = typeof r.json_override === 'string' ? JSON.parse(r.json_override || '{}') : (r.json_override || {}); } catch {}
        const titles = override.experienceTitles || [];
        const visibleNames = lines.map((line, i) => {
            const t = titles.find(t => t.index === i);
            return t?.title || line;
        }).filter(Boolean);

        if (visibleNames.length === 0) continue;

        let catalogo = {};
        try { catalogo = typeof r.catalogo_json === 'string' ? JSON.parse(r.catalogo_json || '{}') : (r.catalogo_json || {}); } catch {}
        if (!catalogo || typeof catalogo !== 'object') catalogo = { categories: [], products: [] };
        if (!catalogo.categories) catalogo.categories = [];
        if (!catalogo.products) catalogo.products = [];

        const productCats = catalogo.products.map(p => p.categoria || p.category).filter(Boolean);
        const merged = [...new Set([...visibleNames, ...catalogo.categories.filter(c => c !== 'Nueva Categoría'), ...productCats])];

        if (JSON.stringify(catalogo.categories) !== JSON.stringify(merged)) {
            catalogo.categories = merged;
            await pool.execute(
                'UPDATE registraya_vcard_registros SET catalogo_json = ? WHERE id = ?',
                [JSON.stringify(catalogo), r.id]
            );
            count++;
            console.log(`  ✅ ${r.nombre} (${r.plan}): ${visibleNames.join(', ')}`);
        }
    }

    console.log(`\nTotal actualizados: ${count}`);
    await pool.end();
}

main().catch(e => console.error('Error:', e));
