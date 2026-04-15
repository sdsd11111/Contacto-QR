const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const sharp = require('sharp');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function restoreData() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    const slug = 'activaqr-9ag4';
    const brainDir = 'C:\\Users\\Smart\\.gemini\\antigravity\\brain\\c03afc99-30c7-47da-9069-b68f3a535bed';
    
    // REAL products = ActivaQR plans from marketing_pricing_activaqr.md
    // Images stay the same, only titles/prices/descriptions change
    const products = [
        {
            id: 'p1',
            titulo: 'Plan Profesional',
            precio: '$20 / año',
            categoria: 'Contacto Digital',
            descripcion: '1 contacto digital profesional diseñado para individuos que buscan destacar.\n\n✅ Perfil con Foto Personalizada\n✅ Código QR Dinámico (Edítalo cuando quieras)\n✅ Botón "Guardar en Agenda" con 1 clic\n✅ Etiquetas inteligentes para búsqueda rápida\n✅ Enlaces a sus Redes Sociales\n✅ Soporte estándar vía WhatsApp',
            imageFile: 'pvc_premium_card_1773350903744.png'
        },
        {
            id: 'p2',
            titulo: 'Plan Equipo ⭐ Más Popular',
            precio: '$80 / año',
            categoria: 'Contacto Digital',
            descripcion: 'La solución ideal para pequeñas empresas y equipos de trabajo. Ahorra 20% · $16 c/u\n\n✅ Todo lo del Plan Profesional\n✅ 5 Contactos Digitales Independientes\n✅ Dashboard de gestión de equipo\n✅ Soporte Prioritario',
            imageFile: 'metal_black_edition_card_1773351055409.png'
        },
        {
            id: 'p3',
            titulo: 'Plan Empresa',
            precio: '$140 / año',
            categoria: 'Contacto Digital',
            descripcion: 'Control total para franquicias y grandes organizaciones. Ahorra 30% · $14 c/u\n\n✅ Todo lo del Plan Equipo\n✅ 10 Contactos Digitales Independientes\n✅ Gestión centralizada por sucursales/franquicias\n✅ Soporte VIP Dedicado',
            imageFile: 'bamboo_eco_card_1773351067816.png'
        },
        {
            id: 'p4',
            titulo: 'Perfil Business Pro',
            precio: '$60',
            categoria: 'Contacto Business',
            descripcion: 'Un perfil de alto impacto visual con diseño ultra-profesional. Enfocado en la conversión y la identidad de marca premium.\n\n✅ Incluye TODOS los beneficios del Plan Profesional\n✅ Diseño Premium Minimalista y Optimización de Branding\n✅ Estrategias de Marketing Integradas\n✅ Marketing de Redes Sociales\n✅ Gestión de ofertas y banners promocionales',
            imageFile: 'qr_cubes_gastronomy_1773351082825.png'
        },
        {
            id: 'p5',
            titulo: 'Master Digital Suite',
            precio: '$120',
            categoria: 'Contacto Business + Catálogo',
            descripcion: 'La herramienta de ventas definitiva. Combina el branding del Perfil Business con un potente motor de ventas online.\n\n✅ Incluye TODO lo de Categoría 1 y 2\n✅ Catálogo Digital Interactivo: vendedor online 24/7\n✅ Vendedor Virtual: QR directo a tu catálogo\n✅ Categorización inteligente de productos\n✅ Botones de contacto directo por WhatsApp',
            imageFile: 'qr_stickers_industrial_1773351307783.png'
        }
    ];

    const processedProducts = [];
    for (const p of products) {
        const filePath = path.join(brainDir, p.imageFile);
        let dataUri = '';
        
        if (fs.existsSync(filePath)) {
            console.log(`Processing ${p.imageFile}...`);
            const buffer = await sharp(filePath)
                .resize(500)
                .webp({ quality: 70 })
                .toBuffer();
            
            const base64 = buffer.toString('base64');
            dataUri = `data:image/webp;base64,${base64}`;
            console.log(`  OK - ${(dataUri.length / 1024).toFixed(0)} KB`);
        }

        processedProducts.push({
            id: p.id,
            categoria: p.categoria,
            titulo: p.titulo,
            url: dataUri,
            descripcion: p.descripcion,
            precio: p.precio
        });
    }

    const catalogo_json = JSON.stringify({
        categories: ['Contacto Digital', 'Contacto Business', 'Contacto Business + Catálogo'],
        products: processedProducts
    });

    const youtube_video_url = 'https://www.youtube.com/watch?v=T_scD4kCmrg';

    console.log(`\nJSON size: ${(catalogo_json.length / 1024).toFixed(0)} KB`);
    
    await connection.execute(
        'UPDATE registraya_vcard_registros SET catalogo_json = ?, youtube_video_url = ? WHERE slug = ?',
        [catalogo_json, youtube_video_url, slug]
    );

    console.log('DONE! Catalog restored with correct plan info.');
    await connection.end();
}

restoreData().catch(console.error);
