import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jsPDF } from 'jspdf';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

// Helper: fetch image and return base64 data URL
async function fetchImageAsBase64(url: string): Promise<string | null> {
    try {
        if (!url || url.includes('placeholder') || url.includes('example.com')) return null;
        
        // If it's already base64
        if (url.startsWith('data:image')) return url;
        
        const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) return null;
        
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const contentType = response.headers.get('content-type') || 'image/png';
        
        return `data:${contentType};base64,${base64}`;
    } catch {
        return null;
    }
}

function getImageFormat(dataUrl: string): string {
    if (dataUrl.includes('image/png')) return 'PNG';
    if (dataUrl.includes('image/webp')) return 'WEBP';
    if (dataUrl.includes('image/gif')) return 'PNG';
    return 'JPEG';
}

// Colors — matching the ActivaQR navy theme
const COLORS = {
    navy: [5, 11, 28] as [number, number, number],
    navyLight: [10, 18, 41] as [number, number, number],
    navyCard: [15, 22, 45] as [number, number, number],
    primary: [255, 107, 0] as [number, number, number],
    accent: [0, 200, 83] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    whiteSubtle: [200, 210, 230] as [number, number, number],
    gray: [120, 135, 165] as [number, number, number],
    lightGray: [180, 190, 210] as [number, number, number],
};

export async function POST(req: NextRequest) {
    try {
        // Auth check
        const adminKey = req.headers.get('x-admin-key') || '';
        if (adminKey !== process.env.ADMIN_API_KEY) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
        }

        // Get full record
        const [rows]: any = await pool.execute(
            'SELECT * FROM registraya_vcard_registros WHERE id = ?',
            [id]
        );

        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
        }

        const r = rows[0];

        // Parse JSON fields
        let galeriaUrls: string[] = [];
        try {
            galeriaUrls = typeof r.galeria_urls === 'string' ? JSON.parse(r.galeria_urls || '[]') : (r.galeria_urls || []);
        } catch { galeriaUrls = []; }

        let etiquetas: string[] = [];
        try {
            if (r.etiquetas) {
                etiquetas = typeof r.etiquetas === 'string' ? JSON.parse(r.etiquetas) : r.etiquetas;
            }
        } catch { etiquetas = []; }

        // ===== PDF GENERATION =====
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageW = 210;
        const pageH = 297;
        const margin = 15;
        const contentW = pageW - margin * 2;
        let y = 0;

        // Helper functions
        const setColor = (color: [number, number, number]) => doc.setTextColor(color[0], color[1], color[2]);
        const setFillColor = (color: [number, number, number]) => doc.setFillColor(color[0], color[1], color[2]);
        const setDrawColor = (color: [number, number, number]) => doc.setDrawColor(color[0], color[1], color[2]);

        // Paint full page background navy blue
        const paintBackground = () => {
            setFillColor(COLORS.navy);
            doc.rect(0, 0, pageW, pageH, 'F');
        };

        const checkNewPage = (neededHeight: number) => {
            if (y + neededHeight > pageH - 35) {
                doc.addPage();
                paintBackground();
                y = 20;
                return true;
            }
            return false;
        };

        const drawSectionTitle = (title: string) => {
            checkNewPage(18);
            // Orange accent bar
            setFillColor(COLORS.primary);
            doc.roundedRect(margin, y, 4, 10, 2, 2, 'F');
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            setColor(COLORS.white);
            doc.text(title.toUpperCase(), margin + 8, y + 7);
            
            // Orange underline
            setDrawColor(COLORS.primary);
            doc.setLineWidth(0.3);
            doc.line(margin + 8, y + 10, margin + 8 + doc.getTextWidth(title.toUpperCase()), y + 10);
            
            y += 16;
        };

        const drawField = (label: string, value: string | null | undefined) => {
            if (!value) return;
            checkNewPage(10);
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            setColor(COLORS.gray);
            doc.text(label.toUpperCase(), margin + 8, y + 4);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            setColor(COLORS.whiteSubtle);
            
            const lines = doc.splitTextToSize(value, contentW - 16);
            doc.text(lines, margin + 8, y + 9);
            y += 6 + (lines.length * 4.5);
        };

        const drawLinkField = (label: string, value: string | null | undefined) => {
            if (!value) return;
            checkNewPage(10);
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            setColor(COLORS.gray);
            doc.text(label.toUpperCase(), margin + 8, y + 4);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setColor(COLORS.primary);

            const lines = doc.splitTextToSize(value, contentW - 16);
            doc.text(lines, margin + 8, y + 9);
            y += 6 + (lines.length * 4);
        };

        // ===== PAGE 1 =====
        paintBackground();

        // ===== HEADER (navy with decorative orange circle) =====
        // Decorative orange circle (top right)
        setFillColor([255, 140, 50]);
        doc.circle(pageW - 5, 5, 30, 'F');
        // Re-cover part of circle so it's subtle
        setFillColor(COLORS.navy);
        doc.rect(0, 0, pageW - 25, 65, 'F');
        
        // Load and draw logo
        try {
            const logoPath = path.join(process.cwd(), 'public', 'images', 'logo_header.png');
            if (fs.existsSync(logoPath)) {
                const logoData = fs.readFileSync(logoPath);
                const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
                doc.addImage(logoBase64, 'PNG', margin, 8, 55, 18);
            }
        } catch {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            setColor(COLORS.white);
            doc.text('ActivaQR', margin, 22);
        }

        // Document title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        setColor(COLORS.white);
        doc.text('DOCUMENTO DE REVISION', margin, 38);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        setColor(COLORS.lightGray);
        doc.text(`Contacto Digital  |  Generado: ${new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, 45);
        
        // Orange accent line
        setFillColor(COLORS.primary);
        doc.rect(0, 62, pageW, 3, 'F');

        y = 72;

        // ===== PROFILE CARD =====
        setFillColor(COLORS.navyCard);
        setDrawColor([30, 40, 70]);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, y, contentW, 55, 4, 4, 'FD');

        // Profile photo — CIRCULAR
        const profileCenterX = margin + 6 + 15; // center of 30mm image
        const profileCenterY = y + 6 + 15;
        const profileRadius = 15;
        
        let hasProfilePhoto = false;
        if (r.foto_url) {
            try {
                const imgData = await fetchImageAsBase64(r.foto_url);
                if (imgData) {
                    // Orange ring around photo
                    setFillColor(COLORS.primary);
                    doc.circle(profileCenterX, profileCenterY, profileRadius + 1.5, 'F');
                    
                    // White ring
                    setFillColor(COLORS.white);
                    doc.circle(profileCenterX, profileCenterY, profileRadius + 0.5, 'F');
                    
                    // Place image (square, but visually masked by circle)
                    doc.addImage(imgData, getImageFormat(imgData), margin + 6, y + 6, 30, 30);
                    
                    // Draw navy "corners" to simulate circle clip
                    // Top-left corner
                    setFillColor(COLORS.navyCard);
                    // We create the illusion of a circle by covering the corners with the card background color
                    // Four corner arcs using small rectangles at the corners of the image
                    const imgX = margin + 6;
                    const imgY = y + 6;
                    const imgS = 30;
                    
                    // Draw corner masks (8 triangular-ish pieces to make circular)
                    for (let angle = 0; angle < 360; angle += 1) {
                        const rad = (angle * Math.PI) / 180;
                        const px = profileCenterX + Math.cos(rad) * (profileRadius + 0.3);
                        const py = profileCenterY + Math.sin(rad) * (profileRadius + 0.3);
                        
                        // Only mask points outside circle but inside square
                        if (px >= imgX && px <= imgX + imgS && py >= imgY && py <= imgY + imgS) {
                            continue; // inside circle, skip
                        }
                    }
                    
                    // Simpler approach: draw 4 corner pieces in card background color
                    // Top-left
                    doc.setFillColor(COLORS.navyCard[0], COLORS.navyCard[1], COLORS.navyCard[2]);
                    
                    // Create a path that covers corners using multiple small rects
                    const cornerSize = 6;
                    // Top corners
                    for (let cx = 0; cx < cornerSize; cx++) {
                        for (let cy = 0; cy < cornerSize; cy++) {
                            const distX = cx < cornerSize/2 ? cornerSize - cx : cx - cornerSize/2;
                            const distY = cy < cornerSize/2 ? cornerSize - cy : cy - cornerSize/2;
                            
                            // Check if point is outside circle
                            const pointX = (cx < cornerSize/2) ? imgX + cx * 0.5 : imgX + imgS - (cornerSize - cx) * 0.5;
                            const pointY = (cy < cornerSize/2) ? imgY + cy * 0.5 : imgY + imgS - (cornerSize - cy) * 0.5;
                            
                            const dist = Math.sqrt(Math.pow(pointX - profileCenterX, 2) + Math.pow(pointY - profileCenterY, 2));
                            if (dist > profileRadius) {
                                doc.rect(pointX, pointY, 0.6, 0.6, 'F');
                            }
                        }
                    }
                    
                    // More effective: just overlay the orange ring to create circular look
                    setDrawColor(COLORS.primary);
                    doc.setLineWidth(1.5);
                    doc.circle(profileCenterX, profileCenterY, profileRadius, 'D');
                    
                    hasProfilePhoto = true;
                }
            } catch { }
        }

        if (!hasProfilePhoto) {
            setFillColor(COLORS.gray);
            doc.circle(profileCenterX, profileCenterY, profileRadius, 'F');
            setColor(COLORS.white);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            const initials = (r.nombre || 'N/A').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
            doc.text(initials, profileCenterX, profileCenterY + 3, { align: 'center' });
        }

        // Profile info
        const infoX = margin + 6 + 30 + 8;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        setColor(COLORS.white);
        doc.text(r.nombre || 'Sin nombre', infoX, y + 14);

        if (r.profesion) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            setColor(COLORS.primary);
            doc.text(r.profesion, infoX, y + 21);
        }

        if (r.empresa) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setColor(COLORS.lightGray);
            doc.text(r.empresa, infoX, y + 28);
        }

        // Plan badge
        const planLabel = r.plan === 'pro' ? 'PLAN PRO $20' : 'PLAN BASIC $10';
        const planBadgeW = doc.getTextWidth(planLabel) + 10;
        setFillColor(r.plan === 'pro' ? COLORS.primary : COLORS.gray);
        doc.roundedRect(infoX, y + 33, planBadgeW, 7, 3, 3, 'F');
        setColor(COLORS.white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text(planLabel, infoX + 5, y + 38);

        // Profile type badge (no emojis)
        if (r.tipo_perfil) {
            const tipoBadge = r.tipo_perfil === 'negocio' ? 'NEGOCIO' : 'PERSONA';
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            setColor(COLORS.gray);
            doc.text(tipoBadge, infoX + planBadgeW + 4, y + 38);
        }

        // Status badge (top right)
        const statusLabel = r.status?.toUpperCase() || 'PENDIENTE';
        const statusColor = r.status === 'pagado' ? COLORS.accent : r.status === 'entregado' ? COLORS.accent : COLORS.primary;
        setFillColor(statusColor);
        const statusBadgeW = doc.getTextWidth(statusLabel) + 14;
        doc.roundedRect(margin + contentW - statusBadgeW - 4, y + 4, statusBadgeW, 8, 4, 4, 'F');
        setColor(COLORS.white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(statusLabel, margin + contentW - statusBadgeW / 2 - 1, y + 10, { align: 'center' });

        y += 62;

        // ===== BIO =====
        if (r.bio) {
            drawSectionTitle('Biografia / Descripcion');
            setFillColor(COLORS.navyCard);
            setDrawColor([30, 40, 70]);
            const bioLines = doc.splitTextToSize(r.bio, contentW - 20);
            const bioHeight = bioLines.length * 4.5 + 10;
            checkNewPage(bioHeight + 4);
            doc.roundedRect(margin, y, contentW, bioHeight, 3, 3, 'FD');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            setColor(COLORS.whiteSubtle);
            doc.text(bioLines, margin + 8, y + 7);
            y += bioHeight + 6;
        }

        // ===== DATOS PERSONALES =====
        drawSectionTitle('Datos de Contacto');
        
        const contactFields = [
            ['Email', r.email],
            ['WhatsApp', r.whatsapp],
            ['Direccion', r.direccion],
        ].filter(([_, v]) => v);
        
        const personaFields = [
            ['Nombres', r.nombres],
            ['Apellidos', r.apellidos],
        ].filter(([_, v]) => v);

        const negocioFields = [
            ['Nombre del Negocio', r.nombre_negocio],
            ['Contacto (Nombre)', r.contacto_nombre],
            ['Contacto (Apellido)', r.contacto_apellido],
        ].filter(([_, v]) => v);

        const allPersonalFields = [...(r.tipo_perfil === 'negocio' ? negocioFields : personaFields), ...contactFields];
        const personalBlockH = allPersonalFields.length * 10 + 8;
        checkNewPage(personalBlockH + 4);
        setFillColor(COLORS.navyCard);
        setDrawColor([30, 40, 70]);
        doc.roundedRect(margin, y, contentW, personalBlockH, 3, 3, 'FD');
        y += 4;

        for (const [label, value] of allPersonalFields) {
            drawField(label as string, value as string);
        }
        y += 4;

        // ===== REDES SOCIALES =====
        const socialLinks = [
            ['Instagram', r.instagram],
            ['Facebook', r.facebook],
            ['LinkedIn', r.linkedin],
            ['TikTok', r.tiktok],
            ['YouTube', r.youtube],
            ['X (Twitter)', r.x],
            ['Google Business', r.google_business],
            ['Sitio Web', r.web],
            ['Menu Digital', r.menu_digital],
        ].filter(([_, v]) => v);

        if (socialLinks.length > 0) {
            drawSectionTitle('Redes Sociales y Enlaces');
            const socialBlockH = socialLinks.length * 9 + 8;
            checkNewPage(socialBlockH + 4);
            setFillColor(COLORS.navyCard);
            setDrawColor([30, 40, 70]);
            doc.roundedRect(margin, y, contentW, socialBlockH, 3, 3, 'FD');
            y += 4;
            
            for (const [label, value] of socialLinks) {
                drawLinkField(label as string, value as string);
            }
            y += 4;
        }

        // ===== WIFI =====
        if (r.wifi_ssid || r.wifi_password) {
            drawSectionTitle('Configuracion WiFi');
            setFillColor(COLORS.navyCard);
            setDrawColor([30, 40, 70]);
            const wifiH = 26;
            checkNewPage(wifiH + 4);
            doc.roundedRect(margin, y, contentW, wifiH, 3, 3, 'FD');
            y += 3;
            drawField('Red (SSID)', r.wifi_ssid);
            drawField('Contrasena', r.wifi_password);
            y += 4;
        }

        // ===== ETIQUETAS =====
        if (etiquetas && etiquetas.length > 0) {
            drawSectionTitle('Etiquetas / Categorias');
            checkNewPage(16);
            
            let tagX = margin + 4;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            
            for (const tag of etiquetas) {
                const tagText = typeof tag === 'string' ? tag : (tag as any).label || String(tag);
                const tagW = doc.getTextWidth(tagText) + 8;
                
                if (tagX + tagW > pageW - margin) {
                    tagX = margin + 4;
                    y += 9;
                }
                
                checkNewPage(12);
                setFillColor(COLORS.primary);
                doc.roundedRect(tagX, y, tagW, 7, 3, 3, 'F');
                setColor(COLORS.white);
                doc.text(tagText, tagX + 4, y + 5);
                tagX += tagW + 3;
            }
            y += 14;
        }

        // ===== PRODUCTOS / SERVICIOS =====
        if (r.productos_servicios) {
            drawSectionTitle('Productos y Servicios');
            setFillColor(COLORS.navyCard);
            setDrawColor([30, 40, 70]);
            const prodLines = doc.splitTextToSize(r.productos_servicios, contentW - 20);
            const prodH = prodLines.length * 4.5 + 12;
            checkNewPage(prodH + 4);
            doc.roundedRect(margin, y, contentW, prodH, 3, 3, 'FD');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            setColor(COLORS.whiteSubtle);
            doc.text(prodLines, margin + 8, y + 8);
            y += prodH + 6;
        }

        // ===== GALERIA =====
        if (galeriaUrls.length > 0) {
            doc.addPage();
            paintBackground();
            y = 20;
            
            drawSectionTitle(`Galeria de Imagenes (${galeriaUrls.length})`);
            
            const imgSize = 52;
            const gap = 5;
            const cols = 3;
            let col = 0;
            
            for (let i = 0; i < galeriaUrls.length && i < 9; i++) {
                try {
                    const imgData = await fetchImageAsBase64(galeriaUrls[i]);
                    if (imgData) {
                        const imgX = margin + col * (imgSize + gap);
                        
                        checkNewPage(imgSize + gap + 10);
                        
                        // Border
                        setDrawColor([40, 55, 90]);
                        doc.setLineWidth(0.5);
                        doc.roundedRect(imgX, y, imgSize, imgSize, 3, 3, 'D');
                        
                        doc.addImage(imgData, getImageFormat(imgData), imgX + 0.5, y + 0.5, imgSize - 1, imgSize - 1);
                        
                        col++;
                        if (col >= cols) {
                            col = 0;
                            y += imgSize + gap;
                        }
                    }
                } catch { }
            }

            if (col > 0) y += imgSize + gap;
        }

        // ===== PORTADAS (Hero Images) =====
        const hasPortadas = (r.portada_desktop && !r.portada_desktop.includes('default')) || 
                           (r.portada_movil && !r.portada_movil.includes('default'));
        
        if (hasPortadas) {
            checkNewPage(80);
            drawSectionTitle('Imagenes de Portada');
            
            if (r.portada_desktop && !r.portada_desktop.includes('default')) {
                try {
                    const imgData = await fetchImageAsBase64(r.portada_desktop);
                    if (imgData) {
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(8);
                        setColor(COLORS.gray);
                        doc.text('PORTADA ESCRITORIO', margin + 4, y + 4);
                        y += 7;
                        checkNewPage(55);
                        doc.addImage(imgData, getImageFormat(imgData), margin, y, contentW, 50);
                        y += 55;
                    }
                } catch { }
            }

            if (r.portada_movil && !r.portada_movil.includes('default')) {
                try {
                    const imgData = await fetchImageAsBase64(r.portada_movil);
                    if (imgData) {
                        checkNewPage(75);
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(8);
                        setColor(COLORS.gray);
                        doc.text('PORTADA MOVIL', margin + 4, y + 4);
                        y += 7;
                        doc.addImage(imgData, getImageFormat(imgData), margin + 30, y, contentW - 60, 60);
                        y += 65;
                    }
                } catch { }
            }
        }

        // ===== FOOTER (on every page — apply to last page) =====
        const totalPages = doc.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
            doc.setPage(p);
            
            const footerY = pageH - 28;
            
            // Orange accent bar
            setFillColor(COLORS.primary);
            doc.rect(0, footerY, pageW, 2, 'F');
            
            // Footer background
            setFillColor([3, 7, 18]);
            doc.rect(0, footerY + 2, pageW, 26, 'F');
            
            // Footer text line 1 — no emojis
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            setColor(COLORS.primary);
            doc.text('DOCUMENTO DE REVISION  --  Por favor verifique todos los datos', pageW / 2, footerY + 10, { align: 'center' });
            
            // Footer text line 2
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            setColor(COLORS.lightGray);
            doc.text('Si encuentra algun error o desea modificar algo, notifiquenos antes de la entrega final.', pageW / 2, footerY + 16, { align: 'center' });
            
            // Footer text line 3
            doc.setFontSize(6.5);
            setColor(COLORS.gray);
            doc.text('ActivaQR  |  2026  |  activaqr.com', pageW / 2, footerY + 22, { align: 'center' });
        }

        // Generate PDF buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        const clientName = (r.nombre || 'contacto').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
        const fileName = `Revision_${clientName}.pdf`;

        // ===== SEND TO WHATSAPP =====
        let whatsappSent = false;
        let whatsappError = '';

        const apiUrl = process.env.EVOLUTION_API_URL;
        const evolutionKey = process.env.EVOLUTION_API_KEY;
        const instance = process.env.EVOLUTION_INSTANCE;
        const targetNumber = '593963410409';

        if (apiUrl && evolutionKey && instance) {
            try {
                const pdfBase64 = pdfBuffer.toString('base64');
                
                const docPayload = {
                    number: targetNumber,
                    media: `data:application/pdf;base64,${pdfBase64}`,
                    fileName: fileName,
                    caption: `*REVISION DE CONTACTO DIGITAL*\n\n*${r.nombre}*\nEmail: ${r.email}\nWhatsApp: ${r.whatsapp || 'N/A'}\nPlan: ${(r.plan || 'basic').toUpperCase()}\n\n_Revise el PDF adjunto con todos los datos del cliente._`
                };

                const waResponse = await fetch(`${apiUrl}/message/sendMedia/${instance}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': evolutionKey
                    },
                    body: JSON.stringify(docPayload)
                });

                if (waResponse.ok) {
                    whatsappSent = true;
                    console.log(`[PDF Review] WhatsApp sent for ${r.nombre} to ${targetNumber}`);
                } else {
                    const waData = await waResponse.json();
                    whatsappError = JSON.stringify(waData);
                    console.error('[PDF Review] WhatsApp error:', whatsappError);
                }
            } catch (waErr: any) {
                whatsappError = waErr.message;
                console.error('[PDF Review] WhatsApp send error:', waErr);
            }
        } else {
            whatsappError = 'Variables de Evolution API no configuradas';
        }

        // Return the PDF for download AND the whatsapp status
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'X-WhatsApp-Sent': whatsappSent ? 'true' : 'false',
                'X-WhatsApp-Error': whatsappError || '',
            }
        });

    } catch (err: any) {
        console.error('[PDF Review] Error:', err);
        return NextResponse.json({ error: err.message || 'Error generando PDF' }, { status: 500 });
    }
}
