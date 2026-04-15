import pool from '../lib/db';

async function checkAndClear() {
    try {
        console.log("--- CHEQUEO DE CHATS DORMIDOS ---");

        // 1. Revisar mensajes no procesados en la cola
        const [queueRows] = await pool.execute(
            'SELECT jid, COUNT(*) as pending_messages, MAX(created_at) as last_message FROM registraya_whatsapp_message_queue WHERE processed = 0 GROUP BY jid'
        );
        const queue = queueRows as any[];

        if (queue.length > 0) {
            console.log("⚠️ Se encontraron chats pendientes en la cola que no han sido procesados:");
            console.table(queue);
            console.log("\nEsto puede suceder si el message-worker no está corriendo continuamente, o si hubo un timeout al procesar (IGNORADOS).");
            console.log("Para 'despertarlos', el worker debería leerlos. Vamos a revisarlos...");
        } else {
            console.log("✅ No hay chats dormidos o pendientes de procesar en la cola.");
        }

        // 2. Revisar historial antes de borrar
        const [historyRows] = await pool.execute('SELECT COUNT(*) as total FROM registraya_whatsapp_history');
        console.log(`\n--- MEMORIA ACTUAL ---`);
        console.log(`Total de mensajes en historial de conversación: ${(historyRows as any)[0].total}`);

        const [leadsRows] = await pool.execute('SELECT COUNT(*) as total FROM registraya_whatsapp_leads');
        console.log(`Total de perfiles/contextos (leads) guardados: ${(leadsRows as any)[0].total}`);

        const [sessionRows] = await pool.execute('SELECT COUNT(*) as total FROM registraya_whatsapp_sessions');
        console.log(`Total de sesiones de usuario activas: ${(sessionRows as any)[0].total}`);

        console.log("\n🧹 PROCEDIENDO A BORRAR LA MEMORIA COMPLETAMENTE...");

        // 3. Clear memory!
        await pool.execute('TRUNCATE TABLE registraya_whatsapp_history');
        await pool.execute('DELETE FROM registraya_whatsapp_leads'); // Safe delete for context
        await pool.execute('DELETE FROM registraya_whatsapp_sessions');

        // Opcional: limpiar toda la cola de mensajes
        await pool.execute('DELETE FROM registraya_whatsapp_message_queue');

        console.log("\n✨ Memoria del bot, historiales y contextos han sido borrados con éxito.");

    } catch (e) {
        console.error("Error BD:", e);
    } finally {
        process.exit(0);
    }
}

checkAndClear();
