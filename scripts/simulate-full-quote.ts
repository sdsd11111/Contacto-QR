import * as dotenv from 'dotenv';
import { resolve } from 'path';
import fs from 'fs';

// Cargar variables de entorno
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const apiUrl = process.env.EVOLUTION_API_URL;
const apiKey = process.env.EVOLUTION_API_KEY;
const instance = process.env.EVOLUTION_INSTANCE;
const cesarPhone = "593963410409";

async function simulateCesarRequest() {
    console.log('🚀 Iniciando simulación de envío de proforma a César...');
    
    try {
        // 1. Llamar a nuestra API interna (asegúrate de que npm run dev esté activo en el puerto 3001)
        const response = await fetch('http://localhost:3001/api/quote/generate-proforma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientName: 'Dueño(a) de Asulei', // Alejandro deduce el nombre si no lo hay
                businessName: 'Asulei',
                planSugerido: 'Catalog',
                introPersonalizada: 'Tener a su disposición un catálogo digital para "Asulei" le permitirá exhibir sus piezas de joyería de forma más atractiva, y sus clientes podrán realizar pedidos listos directamente a su WhatsApp.'
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Error en API PDF: ${response.status} - ${errText}`);
        }

        const pdfBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(pdfBuffer).toString('base64');
        console.log('✅ PDF generado exitosamente.');

        // 2. Enviar por Evolution API
        if (!apiUrl || !apiKey || !instance) {
            throw new Error('Variables de Evolution API no configuradas en .env.local');
        }

        const waResponse = await fetch(`${apiUrl}/message/sendMedia/${instance}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            },
            body: JSON.stringify({
                number: cesarPhone,
                mediatype: 'document',
                mimetype: 'application/pdf',
                media: base64,
                fileName: 'Proforma_Asulei.pdf',
                caption: `📄 *COTIZACIÓN PROFESIONAL ENTREGADA*\n\n👤 Cliente: Dueño(a) de Asulei\n🏢 Negocio: Asulei\n💎 Plan Sugerido: Catalog\n\n💬 *Mensaje de Venta Sugerido (Copiar y Reenviar):*\n"Tener a su disposición un catálogo digital para Asulei le permitirá exhibir sus piezas de joyería de forma más atractiva, y sus clientes podrán realizar pedidos listos directamente a su WhatsApp."\n\n_Alejandra ha generado el archivo PDF corporativo limpio y listo para enviar al cliente._`
            })
        });

        const waResult = await waResponse.json();
        if (waResponse.ok) {
            console.log('✨ ¡Éxito! El PDF ha sido enviado a tu WhatsApp.');
        } else {
            console.error('❌ Error enviando WhatsApp:', waResult);
        }

    } catch (error) {
        console.error('❌ Fallo en la simulación:', error.message);
    }
}

simulateCesarRequest();
