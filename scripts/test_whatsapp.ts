
const EVOLUTION_API_URL = 'http://129.153.116.213:8080';
const EVOLUTION_API_KEY = '42a447c1-3d74-4b52-9571-042c174f7621';
const EVOLUTION_INSTANCE = 'Automatizotunegocio';
const targetNumber = '593967491847';

async function sendTest() {
    const clientName = "Abel";
    const planName = "Contacto Digital"; 
    console.log("Enviando mensaje de Alejandra con CONTACTO a:", targetNumber);
    
    const message = `Hola ${clientName} 👋, soy Alejandra de ActivaQR. ¡Tu ${planName} ya está corriendo! 🚀 Queda pendiente el pago — ¿te mando los datos? 😊 (Tip: agrégame a tus contactos para activar los links)`;

    try {
        const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
            },
            body: JSON.stringify({
                number: targetNumber,
                text: message,
                delay: 1200,
                linkPreview: true
            })
        });

        const data: any = await response.json();
        console.log("Respuesta de Evolution API:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error enviando mensaje:", error);
    }
}

sendTest();
