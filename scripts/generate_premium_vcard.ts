import fs from 'fs';
import path from 'path';

function generateVCard() {
    const imagePath = path.join(process.cwd(), 'public/images/chifa-tianjin/chaulafan.jpg');
    let photoBase64 = '';
    
    try {
        if (fs.existsSync(imagePath)) {
            photoBase64 = fs.readFileSync(imagePath).toString('base64');
        }
    } catch (err) {
        console.error('Error reading image:', err.message);
    }

    const vCardContent = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:Chifa Tianjin 🥢',
        'ORG:Chifa Tianjin Restaurante',
        'TITLE:Comida China de Especialidad',
        'TEL;TYPE=WORK,VOICE:+593939105745',
        'EMAIL;TYPE=PREF,INTERNET:chifatianjin@gmail.com',
        'ADR;TYPE=WORK:;;Loja;Ecuador;;;',
        'URL:https://activaqr.com/card/chifa-tianjin',
        'PHOTO;ENCODING=b;TYPE=JPEG:' + photoBase64,
        'NOTE:Chifa Tianjin es un restaurante tradicional especializado en cocina china con un toque local. Ofrecemos calidad y sabor abundante a precios cómodos. \\n\\nCATEGORÍAS Y ESPECIALIDADES:\\n🍲 Chaufarín\\n🔥 Plancha\\n🦐 Platos de Camarón y Mariscos\\n🍛 Mixtos (Combinaciones)\\n🍜 Tallarín (Fideos)\\n🍚 Chaulafán (Arroz Frito)\\n\\nCreado por www.activaqr.com - Expertos en Contacto Digital QR.',
        'CATEGORIES:Chifa,Comida China,Loja,Restaurante,Chaulafán,ActivaQR',
        'X-SOCIALPROFILE;TYPE=facebook:https://www.facebook.com/chifatianjin/',
        'X-SOCIALPROFILE;TYPE=instagram:https://www.instagram.com/chifatianjin/',
        'END:VCARD'
    ].join('\r\n');

    const outputPath = path.join(process.cwd(), 'public/vcards/chifa-tianjin.vcf');
    fs.writeFileSync(outputPath, vCardContent);
    console.log('vCard Premium generada exitosamente en:', outputPath);
}

generateVCard();
