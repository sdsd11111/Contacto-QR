const nodemailer = require('nodemailer');

async function testEmail() {
    process.stdout.write('Probando conexión SMTP...\n');

    const transporter = nodemailer.createTransport({
        host: 'smtp.cesarreyesjaramillo.com',
        port: 465,
        secure: true,
        auth: {
            user: 'activaqr@cesarreyesjaramillo.com',
            pass: 'Pt376eb9e' // La contraseña que compartiste
        }
    });

    try {
        // Verificar conexión
        await transporter.verify();
        process.stdout.write('✅ Conexión SMTP exitosa al servidor.\n');

        // Intentar enviar un correo de prueba
        process.stdout.write('Intentando enviar correo de prueba...\n');
        const info = await transporter.sendMail({
            from: '"RegistraYa" <registrameya@cesarreyesjaramillo.com>',
            to: 'activaqr@cesarreyesjaramillo.com', // Enviarse a sí mismo para probar
            subject: 'Prueba de configuración SMTP',
            text: 'Si recibes esto, la configuración de Nodemailer está perfecta.',
        });

        process.stdout.write('✅ Correo de prueba enviado con éxito!\n');
        process.stdout.write('Message ID: ' + info.messageId + '\n');
    } catch (error) {
        process.stdout.write('❌ Error en la prueba:\n');
        process.stdout.write(error.message + '\n');
    }
}

testEmail();
