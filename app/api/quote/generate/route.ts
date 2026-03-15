import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import path from 'path';
import fs from 'fs';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

// Sanitize text for jsPDF
function sanitizeText(text: string): string {
    if (!text) return '';
    return text
        .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, ' ') 
        .trim();
}

const COLORS = {
    navy: [5, 11, 28] as [number, number, number],
    primary: [255, 107, 0] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    gray: [120, 135, 165] as [number, number, number],
    lightGray: [200, 210, 230] as [number, number, number],
};

export async function POST(req: NextRequest) {
    try {
        const { name, businessName, whatsapp, productCount, plan, sellerCode } = await req.json();

        // 1. Validate Seller if provided
        let sellerInfo = null;
        if (sellerCode) {
            const [rows]: any = await pool.execute(
                'SELECT id, nombre FROM registraya_vcard_sellers WHERE codigo = ? AND activo = 1',
                [sellerCode]
            );
            if (rows.length > 0) {
                sellerInfo = rows[0];
            }
        }

        // 2. Generate PDF
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageW = 210;
        const margin = 20;
        let y = 30;

        // Background
        doc.setFillColor(COLORS.navy[0], COLORS.navy[1], COLORS.navy[2]);
        doc.rect(0, 0, pageW, 297, 'F');

        // Logo
        try {
            const logoPath = path.join(process.cwd(), 'public', 'images', 'logo_header.png');
            if (fs.existsSync(logoPath)) {
                const logoData = fs.readFileSync(logoPath);
                const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
                doc.addImage(logoBase64, 'PNG', margin, 15, 50, 15);
            }
        } catch (e) {
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.text('ActivaQR', margin, 25);
        }

        // Header
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('PRESUPUESTO / PROFORMA', margin, 50);

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-EC')}`, margin, 58);
        doc.text(`Validez: 15 días`, margin, 63);

        // Client Info Box
        doc.setFillColor(15, 22, 45); // Darker navy
        doc.roundedRect(margin, 75, pageW - (margin * 2), 45, 3, 3, 'F');
        
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.setFontSize(12);
        doc.text('DATOS DEL CLIENTE', margin + 5, 83);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text(`Cliente: ${sanitizeText(name)}`, margin + 5, 92);
        doc.text(`Negocio: ${sanitizeText(businessName)}`, margin + 5, 98);
        doc.text(`WhatsApp: ${whatsapp}`, margin + 5, 104);
        if (sellerInfo) {
            doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
            doc.text(`Asesor: ${sellerInfo.nombre} (${sellerCode})`, margin + 5, 112);
        }

        // Quote Details
        y = 135;
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.setFontSize(14);
        doc.text('DETALLE DEL PLAN SELECCIONADO', margin, y);
        y += 10;

        const planPrice = plan === 'catalog' ? 120 : 60;
        const planName = plan === 'catalog' ? 'Contacto Business + Catálogo' : 'Contacto Business';
        
        doc.setFillColor(25, 35, 60);
        doc.rect(margin, y, pageW - (margin * 2), 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('Concepto', margin + 5, y + 6.5);
        doc.text('Cant.', pageW - margin - 40, y + 6.5);
        doc.text('Total', pageW - margin - 15, y + 6.5);
        y += 15;

        doc.text(planName, margin + 5, y);
        doc.text('1', pageW - margin - 38, y);
        doc.text(`$${planPrice}.00`, pageW - margin - 15, y);
        y += 8;

        if (plan === 'catalog' && productCount > 0) {
            doc.setFontSize(9);
            doc.setTextColor(200, 200, 200);
            doc.text(`- Incluye gestión de ${productCount} productos iniciales`, margin + 8, y);
            y += 8;
        }

        // Subtotal/Total
        y += 5;
        doc.setDrawColor(255, 255, 255);
        doc.line(pageW - margin - 60, y, pageW - margin, y);
        y += 8;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL A PAGAR:', pageW - margin - 60, y);
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.text(`$${planPrice}.00`, pageW - margin - 15, y);

        // Footer / Terms
        y = 220;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('BENEFICIOS INCLUIDOS:', margin, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const benefits = [
            '• Código QR de alta resolución',
            '• Enlace personalizado (activaqr.com/tu-nombre)',
            '• Botón de descarga directa de contacto',
            '• Enlaces a Redes Sociales ilimitados',
            '• Soporte técnico prioritario'
        ];
        benefits.forEach(b => {
            doc.text(b, margin + 5, y);
            y += 6;
        });

        // Final Message
        y = 270;
        doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.rect(0, y, pageW, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('www.activaqr.com  |  Soporte: +593 98 323 7491', pageW / 2, y + 12, { align: 'center' });

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        const fileName = `Cotizacion_${name.replace(/\s+/g, '_')}.pdf`;

        // 3. Send via WhatsApp (Evolution API)
        let whatsappSent = false;
        const apiUrl = process.env.EVOLUTION_API_URL;
        const evolutionKey = process.env.EVOLUTION_API_KEY;
        const instance = process.env.EVOLUTION_INSTANCE;
        const companyNumber = process.env.NOTIFY_WHATSAPP_NUMBER || '593983237491';

        if (apiUrl && evolutionKey && instance) {
            try {
                const pdfBase64 = pdfBuffer.toString('base64');
                const caption = `📊 *NUEVA SOLICITUD DE COTIZACIÓN*\n\n` +
                    `👤 *Cliente:* ${name}\n` +
                    `🏢 *Negocio:* ${businessName}\n` +
                    `📱 *WhatsApp:* ${whatsapp}\n` +
                    `📦 *Plan:* ${planName}\n` +
                    `🔢 *Productos:* ${productCount}\n` +
                    (sellerInfo ? `🤝 *Vendedor:* ${sellerInfo.nombre} (${sellerCode})\n` : '') +
                    `\n_Se adjunta documento formal en PDF._`;

                await fetch(`${apiUrl}/message/sendMedia/${instance}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': evolutionKey },
                    body: JSON.stringify({
                        number: companyNumber,
                        mediatype: 'document',
                        mimetype: 'application/pdf',
                        media: pdfBase64,
                        fileName: fileName,
                        caption: caption
                    })
                });
                whatsappSent = true;
            } catch (waErr) {
                console.error('Error sending Quote PDF via WhatsApp:', waErr);
            }
        }

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'X-WhatsApp-Sent': whatsappSent ? 'true' : 'false',
            }
        });

    } catch (error: any) {
        console.error('Error in /api/quote/generate:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
