const fetch = require('node-fetch');

async function verifyVCard() {
    const slug = 'mundo-azul';
    const url = `http://localhost:3000/api/vcard/${slug}`;

    try {
        const response = await fetch(url);
        const vcard = await response.text();

        console.log('Results for slug:', slug);
        console.log('TEL Check:', vcard.includes('item1.TEL;TYPE=CELL,VOICE:+593967512863'));
        console.log('Label Check:', vcard.includes('item1.X-ABLabel:WhatsApp'));
        console.log('Social Check:', vcard.includes('X-SOCIALPROFILE;type=whatsapp'));
        console.log('IMPP Check:', vcard.includes('IMPP;X-SERVICE-TYPE=WhatsApp:whatsapp:+593967512863'));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

verifyVCard();
