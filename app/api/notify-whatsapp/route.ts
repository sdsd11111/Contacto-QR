import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import path from 'path';
import fs from 'fs';

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

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { 
            name, email, whatsapp, plan, 
            businessName, profession, foto_url, 
            catalogo_json, hero_button_text, hero_action 
        } = body;

        const missingVars = [];
        if (!process.env.EVOLUTION_API_URL) missingVars.push('EVOLUTION_API_URL');
        if (!process.env.EVOLUTION_API_KEY) missingVars.push('EVOLUTION_API_KEY');
        if (!process.env.EVOLUTION_INSTANCE) missingVars.push('EVOLUTION_INSTANCE');
        if (!process.env.NOTIFY_WHATSAPP_NUMBER) missingVars.push('NOTIFY_WHATSAPP_NUMBER');

        if (missingVars.length > 0) {
            console.error("Missing Evolution API vars:", missingVars);
            return NextResponse.json({ error: `Faltan variables en Vercel: ${missingVars.join(', ')}` }, { status: 500 });
        }

        const apiUrl = process.env.EVOLUTION_API_URL;
        const apiKey = process.env.EVOLUTION_API_KEY;
        const instance = process.env.EVOLUTION_INSTANCE;
        const targetNumber = process.env.NOTIFY_WHATSAPP_NUMBER;

        // 1. Generate PDF
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

        // Header Text
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('RESUMEN DE REGISTRO', margin, 50);

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-EC')}`, margin, 58);
        doc.text(`Expediente: RYA-${Date.now().toString().slice(-6)}`, margin, 63);

        // Client Info Box
        doc.setFillColor(15, 22, 45); // Darker navy
        doc.roundedRect(margin, 75, pageW - (margin * 2), 55, 3, 3, 'F');
        
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.setFontSize(12);
        doc.text('DATOS DEL CLIENTE', margin + 5, 83);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text(`Nombre/Negocio: ${sanitizeText(name || businessName)}`, margin + 5, 92);
        doc.text(`Email: ${email}`, margin + 5, 98);
        doc.text(`WhatsApp: ${whatsapp}`, margin + 5, 104);
        doc.text(`Profesión/Giro: ${sanitizeText(profession || 'General')}`, margin + 5, 110);
        doc.text(`Plan: ${plan?.toUpperCase() || 'N/A'}`, margin + 5, 116);
        doc.text(`Status: PENDIENTE DE VALIDACIÓN`, margin + 5, 122);

        // Photo Preview for Business/Catalog
        if (foto_url && (plan === 'business' || plan === 'catalog')) {
            try {
                doc.addImage(foto_url, 'WEBP', pageW - margin - 40, 80, 35, 35);
                doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
                doc.rect(pageW - margin - 40, 80, 35, 35);
            } catch (e) {
                console.error("Error adding foto to PDF:", e);
            }
        }

        // Details
        y = 140;
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.setFontSize(14);
        doc.text('DETALLE DEL PLAN', margin, y);
        y += 10;

        let price = '20.00';
        if (plan === 'business') price = '60.00';
        if (plan === 'catalog') price = '120.00';

        doc.setFillColor(25, 35, 60);
        doc.rect(margin, y, pageW - (margin * 2), 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('Concepto', margin + 5, y + 6.5);
        doc.text('Total', pageW - margin - 15, y + 6.5);
        y += 15;

        doc.text(`Activación Plan ${plan?.toUpperCase()}`, margin + 5, y);
        doc.text(`$${price}`, pageW - margin - 15, y);
        y += 10;

        // Additional Info for higher plans
        if (plan === 'business' || plan === 'catalog') {
            doc.setFontSize(9);
            doc.setTextColor(200, 200, 200);
            doc.text(`- Botón de Acción: ${sanitizeText(hero_button_text || 'Contactar')}`, margin + 5, y);
            y += 6;
            doc.text(`- Acción Principal: ${sanitizeText(hero_action || 'WhatsApp')}`, margin + 5, y);
            y += 8;
        }

        if (plan === 'catalog' && catalogo_json) {
            y += 5;
            doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
            doc.setFontSize(12);
            doc.text('CATÁLOGO / PRODUCTOS INICIALES', margin, y);
            y += 8;

            try {
                const catalog = typeof catalogo_json === 'string' ? JSON.parse(catalogo_json) : catalogo_json;
                const products = catalog.products || [];
                doc.setFontSize(9);
                doc.setTextColor(255, 255, 255);
                products.slice(0, 8).forEach((p: any, i: number) => {
                    doc.text(`${i+1}. ${sanitizeText(p.nombre || p.name)} - $${p.precio || p.price}`, margin + 5, y);
                    y += 5;
                });
                if (products.length > 8) {
                    doc.text(`... y ${products.length - 8} productos adicionales.`, margin + 5, y);
                    y += 6;
                }
            } catch (e) {
                console.error("Error parsing catalog for PDF:", e);
            }
        }

        // Footer
        doc.setDrawColor(255, 255, 255, 0.1);
        doc.line(margin, 275, pageW - margin, 275);
        doc.setTextColor(255, 255, 255, 0.3);
        doc.setFontSize(8);
        doc.text('Este documento es un resumen automático de registro en ActivaQR.com', pageW / 2, 282, { align: 'center' });

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        const pdfBase64 = pdfBuffer.toString('base64');
        const fileName = `Registro_${sanitizeText(name || businessName).replace(/\s+/g, '_')}.pdf`;

        // 2. Send via WhatsApp (Evolution API)
        const message = `🚀 *NUEVO REGISTRO RECIBIDO*\n\n` +
            `👤 *Cliente:* ${name || businessName}\n` +
            `📧 *Email:* ${email}\n` +
            `📱 *WhatsApp:* ${whatsapp}\n` +
            `💎 *Plan:* ${plan?.toUpperCase() || 'N/A'}\n\n` +
            `📄 Se adjunta el resumen en PDF para seguimiento.`;

        const payload = {
            number: targetNumber,
            mediatype: 'document',
            mimetype: 'application/pdf',
            media: pdfBase64,
            fileName: fileName,
            caption: message
        };

        const response = await fetch(`${apiUrl}/message/sendMedia/${instance}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey || ''
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Evolution API Error:", data);
            return NextResponse.json({ error: "Error de Evolution API", details: data }, { status: response.status });
        }

        return NextResponse.json({ success: true, fileName });

    } catch (error: any) {
        console.error("Error in notify-whatsapp route:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

