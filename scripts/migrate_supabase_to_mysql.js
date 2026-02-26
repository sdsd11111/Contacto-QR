const fs = require('fs');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

async function migrate() {
    console.log('🚀 Iniciando migración de Supabase a MySQL...');

    // 1. Cargar datos
    const missingRecords = JSON.parse(fs.readFileSync('scripts/missing_supabase_records.json', 'utf8'));
    const mysqlCurrent = JSON.parse(fs.readFileSync('scripts/mysql_current_registros.json', 'utf8'));
    const mysqlEmails = new Set(mysqlCurrent.map(r => r.email));

    // 2. Conexión DB
    const connection = await mysql.createConnection({
        host: 'mysql.us.stackcp.com',
        port: 42755,
        user: 'Activaqrbasededatos-35303936889f',
        password: 'pwye546gfr',
        database: 'Activaqrbasededatos-35303936889f'
    });

    let successCount = 0;
    let skipCount = 0;

    for (const record of missingRecords) {
        // Omitir colisiones de email
        if (mysqlEmails.has(record.email)) {
            console.log(`⚠️ Omitiendo colisión de email: ${record.email}`);
            skipCount++;
            continue;
        }

        try {
            const editCode = 'RYA-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase();

            // Mapeo de campos
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
                record.id || uuidv4(),
                record.created_at ? new Date(record.created_at) : new Date(),
                record.nombre || '',
                record.email,
                record.whatsapp || null,
                record.profesion || null,
                record.empresa || null,
                record.bio || null,
                record.direccion || null,
                record.web || null,
                record.google_business || null,
                record.instagram || null,
                record.linkedin || null,
                record.facebook || null,
                record.tiktok || null,
                record.productos_servicios || null,
                record.plan || 'basic',
                record.foto_url || null,
                record.comprobante_url || null,
                JSON.stringify(record.galeria_urls || []),
                record.status || 'pendiente',
                record.status === 'pagado' || record.status === 'entregado' ? new Date() : null,
                record.slug,
                record.etiquetas || null,
                'pending',
                11, // Cesar Reyes
                editCode,
                2, // Edit uses
                'persona', // default
                'classic' // default
            ];

            await connection.execute(query, values);
            console.log(`✅ Migrado: ${record.nombre} (${record.slug})`);
            successCount++;
        } catch (err) {
            console.error(`❌ Error migrando ${record.nombre}:`, err.message);
        }
    }

    await connection.end();
    console.log(`\n🎉 Migración finalizada.`);
    console.log(`- Exitosos: ${successCount}`);
    console.log(`- Omitidos: ${skipCount}`);
}

migrate().catch(console.error);
