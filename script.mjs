import fs from 'fs';

const file = 'd:/Abel paginas/Generador QR contacto/Generador de vcard y codigos QR/vcard-app/components/vendedor/DirectVCardRegistration.tsx';
let content = fs.readFileSync(file, 'utf8');

const heroStart = content.indexOf('                                {/* Configuración del Hero');
const heroEnd = content.indexOf('                                {formData.plan === \\'catalog\\' && (');

if (heroStart === -1 || heroEnd === -1) {
    console.log("NOT FOUND", heroStart, heroEnd);
    process.exit(1);
}

const heroBlock = content.substring(heroStart, heroEnd);
content = content.replace(heroBlock, '');

const insertPattern = '                            </motion.div>\\n                        )}\\n\\n                        {/* STEP 5: Hero & Catálogo */}';
content = content.replace(insertPattern, '\\n' + heroBlock + '\\n' + insertPattern);

fs.writeFileSync(file, content);
console.log("Done");
