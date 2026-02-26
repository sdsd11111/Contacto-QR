import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const text = "Soy la odontóloga Carmen Ordóñez, profesional en salud bucal y cofundadora de Bocus Dental Estudio en Loja. Me especializo en el cuidado integral de la sonrisa, combinando estética y funcionalidad para lograr resultados naturales y armónicos. Mi enfoque está en la atención personalizada, la prevención y los tratamientos de ortodoncia y estética dental, acompañando a cada paciente durante todo su proceso para que sonría con seguridad y confianza.\n\nProductos/Servicios:\n🪥 Tratamientos dentales completos\n\nConsulta dental general y diagnóstico bucal\n\nLimpiezas dentales profesionales";

const escapeVCardValue = (text: string) => {
    if (!text) return '';
    return text
        .replace(/\\/g, '\\\\')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;')
        .replace(/\r?\n/g, '\\n');
};

const noteContent = escapeVCardValue(text);

const vcardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:Carmen Ordóñez`,
    `N:Ordóñez;Carmen;;;`,
    `TITLE:Clínica dental / Ortodoncia`,
    `ORG:Bocus Dental Estudio`,
    `TEL;TYPE=CELL,VOICE:593991553818`,
    `EMAIL;TYPE=WORK,INTERNET:bocusdentalstudio@gmail.com`,
    `ADR;TYPE=WORK:;;Mercadillo entre Sucre y Bolívar\\, junto a la cooperativa Padre Julián Lorente;;;;`,
    `URL:`,
    `NOTE:${noteContent}`,
    'END:VCARD'
];

const vcard = vcardLines.filter(Boolean).join('\\r\\n');
console.log(vcard);
writeFileSync(path.join(process.cwd(), 'scripts', 'test.vcf'), vcardLines.filter(Boolean).join('\r\n'));
