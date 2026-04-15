import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { clientName, businessName, planSugerido, introPersonalizada } = await req.json();

        // 1. Load the original PDF template
        const templatePath = path.join(process.cwd(), 'public', 'cotizaciones en pdf para activaqr.pdf');
        if (!fs.existsSync(templatePath)) {
            throw new Error('Template PDF not found in public directory');
        }
        
        const templateBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(templateBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        // 2. Embed fonts
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // 3. Overlay the Client Name
        // Moviendo headerX a 58 para alinearlo con el inicio de la línea naranja y la "Q" de abajo.
        const headerX = 58;
        const headerY = 708;

        // Draw a white rectangle to hide "Hola NOMBRE" completely
        firstPage.drawRectangle({
            x: headerX - 2,
            y: headerY - 2,
            width: 300,
            height: 16,
            color: rgb(1, 1, 1), // White
        });

        // Write the new dynamic phrase: "Hola Juan Pérez"
        firstPage.drawText(`Hola ${clientName || 'Cliente'}`, {
            x: headerX,
            y: headerY,
            size: 14,
            font: helveticaBold,
            color: rgb(0.2, 0.2, 0.2), // Dark gray
        });

        // NOTA: Se eliminó la inyección de `introPersonalizada` en el PDF porque
        // el diseño original no tiene espacio vertical libre antes del siguiente título.


        // 5. Serialize PDF and send
        const pdfBytes = await pdfDoc.save();
        const fileName = `Cotizacion_${(clientName || 'Propuesta').replace(/\s+/g, '_')}.pdf`;

        return new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            }
        });

    } catch (err: any) {
        console.error('[GEN PROFORMA ERROR]:', err);
        return NextResponse.json({ error: err.message || 'Error generating PDF' }, { status: 500 });
    }
}
