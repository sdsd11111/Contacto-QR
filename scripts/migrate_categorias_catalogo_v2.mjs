/**
 * Script v2: Sincroniza los TÍTULOS REALES de "Categorías (Experiencia)"
 * al catálogo, SOLO para registros con plan 'catalogo'.
 * 
 * Lee json_override.experienceTitles + productos_servicios para obtener
 * el nombre VISIBLE de cada categoría.
 * 
 * Solo AGREGA, no elimina nada del catálogo existente.
 *
 * Uso: node scripts/migrate_categorias_catalogo_v2.mjs
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env.local') });
config({ path: path.join(__dirname, '..', '.env') });

const DB_CONFIG = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'activaqr',
};

async function main() {
    console.log('🔍 Conectando...');
    const pool = mysql.createPool(DB_CONFIG);

    // Backup
    const backupDir = path.join(__dirname, '..', '_backups');
    fs.mkdirSync(backupDir, { recursive: true });
    const backupFile = path.join(backupDir, `backup_catalogo_v2_${Date.now()}.json`);

    console.log('📦 Buscando registros con plan = catalogo...');
    const [rows] = await pool.execute(
        `SELECT id, slug, nombre, plan, productos_servicios, catalogo_json, json_override 
         FROM registraya_vcard_registros 
         WHERE plan IN ('catalogo', 'business') 
         AND productos_servicios IS NOT NULL 
         AND productos_servicios != ''`
    );

    console.log(`📊 Registros con catálogo/business: ${rows.length}`);

    // Backup
    const backupData = rows.map(r => ({
        id: r.id,
        slug: r.slug,
        nombre: r.nombre,
        catalogo_json_original: r.catalogo_json,
    }));
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`💾 Backup: ${backupFile}`);

    let actualizados = 0;
    let errores = 0;

    for (const row of rows) {
        try {
            // 1. Leer líneas base de productos_servicios
            const rawLines = (row.productos_servicios || '')
                .split('\n')
                .map(l => l.trim())
                .filter(Boolean);

            if (rawLines.length === 0) continue;

            // 2. Leer títulos personalizados de json_override.experienceTitles
            let customTitles = [];
            try {
                const override = typeof row.json_override === 'string'
                    ? JSON.parse(row.json_override || '{}')
                    : (row.json_override || {});
                customTitles = override.experienceTitles || [];
            } catch {}

            // 3. Obtener el nombre VISIBLE de cada categoría
            const visibleNames = rawLines.map((line, index) => {
                const custom = customTitles.find(t => t.index === index);
                return custom?.title || line;
            });

            // 4. Parsear catalogo_json actual
            let catalogo = row.catalogo_json;
            if (typeof catalogo === 'string') {
                try { catalogo = JSON.parse(catalogo); } catch { catalogo = null; }
            }
            if (!catalogo || typeof catalogo !== 'object') {
                catalogo = { categories: [], products: [] };
            }
            if (!catalogo.categories) catalogo.categories = [];
            if (!catalogo.products) catalogo.products = [];

            // 5. Extraer categorías usadas por productos existentes
            const existingProductCats = catalogo.products
                .map(p => p.categoria || p.category)
                .filter(Boolean);

            // 6. Fusionar SIN ELIMINAR: nombres visibles + categorías de productos
            const merged = [...new Set([...visibleNames, ...catalogo.categories, ...existingProductCats])];

            // 7. Solo actualizar si hay cambios
            const currentCats = JSON.stringify(catalogo.categories);
            const newCats = JSON.stringify(merged);

            if (currentCats !== newCats) {
                catalogo.categories = merged;
                await pool.execute(
                    `UPDATE registraya_vcard_registros SET catalogo_json = ? WHERE id = ?`,
                    [JSON.stringify(catalogo), row.id]
                );
                actualizados++;

                if (actualizados <= 10 || actualizados % 20 === 0) {
                    console.log(`  ✅ ${row.nombre || row.slug} (${row.plan}): ${visibleNames.length} categorías → ${merged.length} total`);
                }
            }
        } catch (err) {
            errores++;
            console.error(`  ❌ Error ${row.id}: ${err.message}`);
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Migración v2 completada:`);
    console.log(`   - Procesados: ${rows.length}`);
    console.log(`   - Actualizados: ${actualizados}`);
    console.log(`   - Errores: ${errores}`);
    console.log(`   - Backup: ${backupFile}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await pool.end();
}

main().catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
});
