const http = require('http');

/**
 * Script para procesar la cola de WhatsApp manualmente.
 * Ejecutar con: node scripts/process_whatsapp_queue.js
 */
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/webhook/whatsapp/process-queue',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('✅ Status:', res.statusCode);
        console.log('📦 Respuesta:', data);
    });
});

req.on('error', (error) => {
    console.error('❌ Error al conectar:', error.message);
    console.log('Asegúrese de que el servidor Next.js esté corriendo en el puerto 3000.');
});

req.end();
