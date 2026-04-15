const fs = require('fs');
const file = 'd:/Abel paginas/Generador QR contacto/Generador de vcard y codigos QR/vcard-app/components/vendedor/DirectVCardRegistration.tsx';
let content = fs.readFileSync(file, 'utf8');

const heroStart = content.indexOf(`                                {/* Configuración del Hero (Solo para Business y Catalog) */}`);
const heroEnd = content.indexOf(`                                {formData.plan === 'catalog' && (`);

if (heroStart === -1 || heroEnd === -1) {
    console.log("NOT FOUND", heroStart, heroEnd);
    process.exit(1);
}

const heroBlock = content.substring(heroStart, heroEnd);
content = content.replace(heroBlock, '');

const insertPattern1 = `                            </motion.div>\r\n                        )}\r\n\r\n                        {/* STEP 5: Hero & Catálogo */}`;
const insertPattern2 = `                            </motion.div>\n                        )}\n\n                        {/* STEP 5: Hero & Catálogo */}`;

if (content.indexOf(insertPattern1) !== -1) {
    content = content.replace(insertPattern1, `\r\n` + heroBlock + insertPattern1);
    console.log("Replaced using Windows newlines");
} else if (content.indexOf(insertPattern2) !== -1) {
    content = content.replace(insertPattern2, `\n` + heroBlock + insertPattern2);
    console.log("Replaced using Unix newlines");
} else {
    console.log("TARGET NOT FOUND");
    process.exit(1);
}

fs.writeFileSync(file, content);
console.log("Done");
