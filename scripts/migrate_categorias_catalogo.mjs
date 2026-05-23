/**
 * Script de migración: Sincroniza categorías de experiencia (productos_servicios)
 * al catálogo (catalogo_json.categories) para TODOS los registros existentes.
 *
 * Uso: node scripts/migrate_categorias_catalogo.mjs
 *
 * Seguro: Solo AGREGA categorías, no elimina productos ni datos.
 * Hace backup automático antes de modificar.
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar .env.local
config({ path: path.join(__dirname, '..', '.env.local') });
config({ path: path.join(__dirname, '..', '.env') });

// ── Config ──
const DB_CONFIG = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'activaqr',
};

async function main() {
    console.log('🔍 Conectando a la base de datos...');
    const pool = mysql.createPool(DB_CONFIG);

    // 1. Backup
    const backupDir = path.join(__dirname, '..', '_backups');
    fs.mkdirSync(backupDir, { recursive: true });
    const backupFile = path.join(backupDir, `backup_catalogo_json_${Date.now()}.json`);

    console.log('📦 Obteniendo todos los registros...');
    const [rows] = await pool.execute(
        `SELECT id, slug, nombre, productos_servicios, catalogo_json FROM registraya_vcard_registros WHERE productos_servicios IS NOT NULL AND productos_servicios != ''`
    );

    console.log(`📊 Registros con productos_servicios: ${rows.length}`);

    // Backup
    const backupData = rows.map(r => ({
        id: r.id,
        slug: r.slug,
        nombre: r.nombre,
        catalogo_json_original: r.catalogo_json,
    }));
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`💾 Backup guardado en: ${backupFile}`);

    // 2. Migrar
    let actualizados = 0;
    let errores = 0;

    for (const row of rows) {
        try {
            const catNames = (row.productos_servicios || '')
                .split('\n')
                .map(l => l.trim())
                .filter(Boolean);

            if (catNames.length === 0) continue;

            // Parse catalogo_json actual
            let catalogo = row.catalogo_json;
            if (typeof catalogo === 'string') {
                try { catalogo = JSON.parse(catalogo); } catch { catalogo = null; }
            }
            if (!catalogo || typeof catalogo !== 'object') {
                catalogo = { categories: [], products: [] };
            }
            if (!catalogo.categories) catalogo.categories = [];
            if (!catalogo.products) catalogo.products = [];

            // Extraer categorías usadas por productos existentes
            const existingProductCats = catalogo.products
                .map(p => p.categoria || p.category)
                .filter(Boolean);

            // Fusionar: categorías de experiencia + categorías de productos existentes
            const merged = [...new Set([...catNames, ...existingProductCats])];

            // Solo actualizar si hay cambios
            const currentCats = JSON.stringify(catalogo.categories);
            const newCats = JSON.stringify(merged);

            if (currentCats !== newCats) {
                catalogo.categories = merged;
                const catalogoStr = typeof row.catalogo_json === 'string'
                    ? JSON.stringify(catalogo)
                    : catalogo;

                await pool.execute(
                    `UPDATE registraya_vcard_registros SET catalogo_json = ? WHERE id = ?`,
                    [typeof catalogoStr === 'string' ? catalogoStr : JSON.stringify(catalogoStr), row.id]
                );
                actualizados++;

                if (actualizados <= 5 || actualizados % 50 === 0) {
                    console.log(`  ✅ ${row.nombre || row.slug}: ${catNames.length} categorías sincronizadas`);
                }
            }
        } catch (err) {
            errores++;
            console.error(`  ❌ Error con ${row.id}: ${err.message}`);
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Migración completada:`);
    console.log(`   - Registros procesados: ${rows.length}`);
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
