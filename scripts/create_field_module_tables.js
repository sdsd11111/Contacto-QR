const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function run() {
    console.log('Connecting to database...');
    let conn;
    try {
        conn = await mysql.createConnection({
            host: 'mysql.us.stackcp.com',
            port: 42473,
            user: 'codigosQR-35303938ed5b',
            password: '5plnsc8lhv',
            database: 'codigosQR-35303938ed5b'
        });
        console.log('Connected to database.');
    } catch (err) {
        console.error('Failed to connect to database:', err);
        return;
    }

    try {
        console.log('--- Creando Tablas del Módulo de Recorridos ---');

        // 1. Tabla de Visitas de Campo
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS registraya_vcard_field_visits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                seller_id INT NOT NULL,
                business_name VARCHAR(200) NOT NULL,
                contact_name VARCHAR(150),
                business_category ENUM('restaurante','comercio','medico','salon_belleza','tienda_ropa','ferreteria','farmacia','hotel','educacion','otro') NOT NULL,
                business_size ENUM('micro','pequeño','mediano') DEFAULT 'micro',
                contact_role ENUM('dueño','encargado','empleado') DEFAULT 'dueño',
                result ENUM('no_interesado','seguimiento','cerrado') NOT NULL,
                main_objection VARCHAR(300),
                notes TEXT,
                high_ticket_signal TINYINT(1) DEFAULT 0,
                audio_url VARCHAR(500),
                audio_transcription TEXT,
                location_sector VARCHAR(150),
                latitude DECIMAL(10,7),
                longitude DECIMAL(10,7),
                contact_qr_shared TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (seller_id) REFERENCES registraya_vcard_sellers(id)
            )
        `);
        console.log('✅ Tabla registraya_vcard_field_visits creada.');

        // 2. Tabla de Seguimientos (Follow-ups)
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS registraya_vcard_follow_ups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                visit_id INT NOT NULL,
                seller_id INT NOT NULL,
                scheduled_date DATE,
                ai_suggested_date DATE,
                ai_reasoning TEXT,
                whatsapp_message TEXT,
                status ENUM('pendiente','enviado','completado','descartado') DEFAULT 'pendiente',
                completed_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (visit_id) REFERENCES registraya_vcard_field_visits(id) ON DELETE CASCADE,
                FOREIGN KEY (seller_id) REFERENCES registraya_vcard_sellers(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Tabla registraya_vcard_follow_ups creada.');

        // 3. Tabla de Fichas Estratégicas
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS registraya_vcard_strategic_cards (
                id INT AUTO_INCREMENT PRIMARY KEY,
                business_category ENUM('restaurante','comercio','medico','salon_belleza','tienda_ropa','ferreteria','farmacia','hotel','educacion','otro') NOT NULL,
                pain_point VARCHAR(300) NOT NULL,
                attention_grabber VARCHAR(300) NOT NULL,
                recommended_angle VARCHAR(300) NOT NULL,
                objection_response VARCHAR(300) NOT NULL,
                avoid_mentioning VARCHAR(300),
                created_by INT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla registraya_vcard_strategic_cards creada.');

        // Insertar algunes fichas de prueba (Opcional, para que el frontend ya tenga datos reales)
        console.log('--- Insertando Fichas Estratégicas de Prueba ---');

        const countRes = await conn.execute('SELECT COUNT(*) as count FROM registraya_vcard_strategic_cards');
        if (countRes[0][0].count === 0) {
            await conn.execute(`
                INSERT INTO registraya_vcard_strategic_cards 
                (business_category, pain_point, attention_grabber, recommended_angle, objection_response, avoid_mentioning)
                VALUES 
                ('restaurante', 'No tienen tiempo para actualizar precios en menú físico y el PDF es incómodo', '¿Nota cómo sus clientes hacen zoom incómodo en el PDF y aún le preguntan qué ingredientes tiene?', 'El menú digital editable les ahorra impresiones y permite vender más recomendando platos', '¿Muy caro? Sale más barato que reimprimir menús físicos cada vez que cambia un precio', 'No decir código QR, decir Menú Interactivo'),
                ('medico', 'Pacientes se olvidan de las citas o pierden el contacto para agendar la próxima', '¿Cuántas consultas pierde a la semana por pacientes que se olvidan de su cita?', 'Tarjeta digital con botón directo a WhatsApp y enlace para agendar cita', '¿No soy de tecnología? Se comparte igual que una foto en WhatsApp, es facilísimo', 'No decir página web, decir Tarjeta de Presentación Premium')
            `);
            console.log('✅ Fichas estratégicas de prueba insertadas.');
        } else {
            console.log('ℹ️ Fichas estratégicas ya existen, saltando inserción.');
        }

    } catch (error) {
        console.error('Error al crear tablas:', error);
    } finally {
        await conn.end();
    }
}

run();
