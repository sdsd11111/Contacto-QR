const fs = require('fs');
const data = JSON.parse(fs.readFileSync('d:/Abel paginas/Generador QR contacto/Generador de vcard y codigos QR/vcard-app/output_record.json', 'utf8'));
console.log('--- VCARD RECORD FIELDS ---');
console.log('id:', data.id);
console.log('slug:', data.slug);
console.log('youtube:', data.youtube);
console.log('youtube_video_url:', data.youtube_video_url);
console.log('---------------------------');
