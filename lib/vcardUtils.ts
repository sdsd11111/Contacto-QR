/**
 * Utility for generating standardized VCF (vCard) files for ActivaQR.
 * Ensures parity between registration, admin editing, and client downloads.
 */

export interface VCardData {
    tipo_perfil?: 'persona' | 'negocio';
    nombres?: string;
    apellidos?: string;
    nombre_negocio?: string;
    contacto_nombre?: string;
    contacto_apellido?: string;
    profession?: string;
    company?: string;
    whatsapp: string;
    email?: string;
    address?: string;
    web?: string;
    bio?: string;
    productos_servicios?: string;
    etiquetas?: string;
    google_business?: string;
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    tiktok?: string;
    menu_digital?: string;
}

/**
 * Generates a VCF string (Version 4.0) based on the provided profile data.
 * @param data The profile data object.
 * @param photoBase64 Optional base64-encoded JPEG image (without the data:image/jpeg;base64, prefix).
 */
export function generateVCard(data: VCardData, photoBase64: string | null): string {
    let photoBlock = '';
    if (photoBase64) {
        // Remove the prefix if it exists
        const cleanBase64 = photoBase64.includes(',') ? photoBase64.split(',')[1] : photoBase64;
        // Fold base64 string to 72 characters per line per vCard spec
        const folded = cleanBase64.match(/.{1,72}/g)?.join('\r\n ') || cleanBase64;
        photoBlock = `PHOTO;ENCODING=b;TYPE=JPEG:data:image/jpeg;base64,${folded}`;
    }

    let fullName = '';
    let structuredName = '';
    let organization = '';

    if (data.tipo_perfil === 'negocio') {
        fullName = data.nombre_negocio || '';
        organization = data.nombre_negocio || '';
        if (data.contacto_nombre || data.contacto_apellido) {
            structuredName = `${data.contacto_apellido || ''};${data.contacto_nombre || ''};;;`;
        } else {
            structuredName = ';;;;';
        }
    } else {
        fullName = `${data.nombres || ''} ${data.apellidos || ''}`.trim();
        structuredName = `${data.apellidos || ''};${data.nombres || ''};;;`;
        organization = data.company || "";
    }

    // Clean phone for tel: URI
    const cleanPhone = data.whatsapp.replace(/\D/g, '');
    
    // Construct Note
    let noteContent = '';
    if (data.bio) noteContent += data.bio;
    if (data.productos_servicios) {
        noteContent += (noteContent ? '\n\n' : '') + 'Productos/Servicios:\n' + data.productos_servicios;
    }
    noteContent += (noteContent ? '\n\n' : '') + 'Generado con ActivaQR';
    if (data.google_business) {
        noteContent += '\n\nUbicación/Google Maps: ' + data.google_business;
    }

    const vcardLines = [
        'BEGIN:VCARD',
        'VERSION:4.0',
        `FN;CHARSET=UTF-8:${fullName}`,
        `N;CHARSET=UTF-8:${structuredName}`,
        data.profession ? `TITLE;CHARSET=UTF-8:${data.profession}` : '',
        organization ? `ORG;CHARSET=UTF-8:${organization}` : '',
        `TEL;TYPE=cell,text,voice;VALUE=uri:tel:+${cleanPhone}`,
        data.email ? `EMAIL;TYPE=work:${data.email}` : '',
        data.address ? `ADR;TYPE=work;LABEL="${data.address.replace(/"/g, "'")}":;;${data.address};;;;` : '',
        data.web ? `URL:${data.web}` : '',
        data.google_business ? `URL;type=GOOGLE_BUSINESS:${data.google_business}` : '',
        `NOTE:${noteContent.replace(/\n/g, '\\n')}`,
        data.etiquetas ? `CATEGORIES:${data.etiquetas}` : '',
        photoBlock,
        data.instagram ? `X-SOCIALPROFILE;TYPE=instagram;LABEL=Instagram:${data.instagram}` : '',
        data.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin;LABEL=LinkedIn:${data.linkedin}` : '',
        data.facebook ? `X-SOCIALPROFILE;TYPE=facebook;LABEL=Facebook:${data.facebook}` : '',
        data.tiktok ? `X-SOCIALPROFILE;TYPE=tiktok;LABEL=TikTok:${data.tiktok}` : '',
        data.menu_digital ? `URL;type=MenuDigital:${data.menu_digital}` : '',
        `X-SOCIALPROFILE;TYPE=whatsapp;LABEL=WhatsApp:https://wa.me/${cleanPhone}`,
        `REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        'END:VCARD'
    ];

    return vcardLines.filter(line => line !== '').join('\r\n');
}

/**
 * Converts a base64 VCF string to a Blob for download.
 */
export function vcfToBlob(vcfContent: string): Blob {
    return new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
}
/**
 * Converts an image URL to a base64 string.
 * Useful for embedding remote images into VCards on the client side.
 */
export async function imageUrlToBase64(url: string): Promise<string | null> {
    if (!url) return null;
    if (url.startsWith('data:image')) return url.split(',')[1];
    
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error converting image URL to base64:', error);
        return null;
    }
}
