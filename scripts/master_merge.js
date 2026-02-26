const fs = require('fs');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

async function masterMerge() {
    console.log('🏗️  Iniciando MASTER MERGE (Sincronización Total)...');

    // 1. Cargar fuentes
    const supLive = JSON.parse(fs.readFileSync('scripts/supabase_live_data.json', 'utf8'));
    const oldDb = JSON.parse(fs.readFileSync('scripts/old_db_data.json', 'utf8'));
    const mysqlInitial = JSON.parse(fs.readFileSync('scripts/mysql_current_registros.json', 'utf8'));

    // 2. Indexar datos
    const allRecords = new Map();

    // Prioridad 1: Supabase Live (Dato más fresco)
    supLive.forEach(r => {
        allRecords.set(r.slug.toLowerCase(), { ...r, source: 'Supabase Live' });
    });

    // Prioridad 2: OLD_DB (Para rescatar datos completos de MySQL que no están en Supabase)
    oldDb.forEach(r => {
        const slug = r.slug.toLowerCase();
        if (!allRecords.has(slug)) {
            allRecords.set(slug, { ...r, source: 'OLD_DB' });
        }
    });

    // Prioridad 3: Initial MySQL (Para rescatar al menos el nombre/email si no hay nada más)
    mysqlInitial.forEach(r => {
        const slug = r.slug.toLowerCase();
        if (!allRecords.has(slug)) {
            // Nota: Estos solo tienen slug, email, nombre. Los insertaremos como básicos.
            allRecords.set(slug, { ...r, source: 'Initial MySQL (Parcial)', plan: 'basic', status: 'pendiente' });
        }
    });

    console.log(`📊 Únicos detectados en todas las fuentes: ${allRecords.size}`);

    // 3. Conexión a DB Final
    const connection = await mysql.createConnection({
        host: 'mysql.us.stackcp.com',
        port: 42755,
        user: 'Activaqrbasededatos-35303936889f',
        password: 'pwye546gfr',
        database: 'Activaqrbasededatos-35303936889f'
    });

    // Limpiar tabla para evitar conflictos y asegurar estado puro
    // ADVERTENCIA: Solo registros. No tocamos vendedores.
    console.log('🧹 Limpiando tabla registraya_vcard_registros para inserción pura...');
    await connection.execute('DELETE FROM registraya_vcard_registros');

    let success = 0;
    for (const [slug, r] of allRecords) {
        try {
            const editCode = 'RYA-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase();

            const query = `
                INSERT INTO registraya_vcard_registros (
                    id, created_at, nombre, email, whatsapp, profesion, empresa, bio, direccion,
                    web, google_business, instagram, linkedin, facebook, tiktok, productos_servicios,
                    plan, foto_url, comprobante_url, galeria_urls, status, paid_at, slug, etiquetas,
                    commission_status, seller_id, edit_code, edit_uses_remaining,
                    tipo_perfil, template_id
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                    ?, ?, ?, ?, ?, ?, ?, 
                    ?, ?, ?, ?, ?, ?, ?, ?, 
                    ?, ?, ?, ?,
                    ?, ?
                )
            `;

            const values = [
                r.id || uuidv4(),
                r.created_at ? new Date(r.created_at) : new Date(),
                r.nombre || '',
                r.email,
                r.whatsapp || null,
                r.profesion || null,
                r.empresa || null,
                r.bio || null,
                r.direccion || null,
                r.web || null,
                r.google_business || null,
                r.instagram || null,
                r.linkedin || null,
                r.facebook || null,
                r.tiktok || null,
                r.productos_servicios || null,
                r.plan || 'basic',
                r.foto_url || null,
                r.comprobante_url || null,
                typeof r.galeria_urls === 'string' ? r.galeria_urls : JSON.stringify(r.galeria_urls || []),
                r.status || 'pendiente',
                r.status === 'pagado' || r.status === 'entregado' ? new Date() : null,
                r.slug,
                r.etiquetas || null,
                'pending',
                11, // Cesar Reyes
                editCode,
                2, // Edit uses
                'persona',
                'classic'
            ];

            await connection.execute(query, values);
            success++;
        } catch (err) {
            console.error(`❌ Error insertando ${r.nombre} (${slug}):`, err.message);
        }
    }

    await connection.end();
    console.log(`\n🎉 MASTER MERGE FINALIZADO.`);
    console.log(`- Registros totales en MySQL: ${success}`);
    console.log(`- Fuentes unificadas: Supabase Live, OLD_DB y MySQL Initial.`);
}

masterMerge().catch(console.error);
