const fetch = require('node-fetch');

async function verifyVCard() {
    const slug = 'mundo-azul'; // Example slug
    const url = `http://localhost:3000/api/vcard/${slug}`;

    console.log(`Fetching VCard from: ${url}`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }

        const vcard = await response.text();
        console.log('--- VCard Content ---');
        console.log(vcard);
        console.log('---------------------');

        const hasWhatsAppSocial = vcard.includes('X-SOCIALPROFILE;type=whatsapp');
        const hasIMPP = vcard.includes('IMPP;X-SERVICE-TYPE=WhatsApp');
        const hasTikTokSocial = vcard.includes('X-SOCIALPROFILE;type=tiktok');

        console.log(`Has WhatsApp X-SOCIALPROFILE: ${hasWhatsAppSocial}`);
        console.log(`Has WhatsApp IMPP: ${hasIMPP}`);
        console.log(`Has TikTok X-SOCIALPROFILE: ${hasTikTokSocial}`);

        if (hasWhatsAppSocial && hasIMPP) {
            console.log('✅ Verification Successful: WhatsApp tags are present.');
        } else {
            console.log('❌ Verification Failed: Some tags are missing.');
        }
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

verifyVCard();
