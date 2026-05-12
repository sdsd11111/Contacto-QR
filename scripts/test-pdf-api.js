const fetch = require('node-fetch');
const fs = require('fs');

async function testPdf() {
    console.log('🧪 Probando generación de proforma...');
    try {
        const response = await fetch('http://localhost:3001/api/quote/generate-proforma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientName: 'Juan Pérez',
                businessName: 'Ferretería El Clavo',
                planSugerido: 'Catalog',
                introPersonalizada: 'Esta proforma está diseñada para que tu ferretería tenga un catálogo de WhatsApp profesional.'
            })
        });

        if (response.ok) {
            const buffer = await response.buffer();
            fs.writeFileSync('test_proforma.pdf', buffer);
            console.log('✅ PDF generado con éxito: test_proforma.pdf');
        } else {
            console.error('❌ Error en la API:', response.status, response.statusText);
        }
    } catch (err) {
        console.error('❌ Error de conexión:', err.message);
    }
}

testPdf();
