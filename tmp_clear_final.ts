import pool from './lib/db';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function clearHistory(phone: string) {
    const jid = `${phone}@s.whatsapp.net`;
    console.log(`🧹 Clearing all data for: ${jid}`);

    try {
        const [m] = await pool.execute('DELETE FROM registraya_whatsapp_messages WHERE jid = ?', [jid]);
        console.log(`✅ Messages deleted: ${(m as any).affectedRows}`);

        const [l] = await pool.execute('DELETE FROM registraya_whatsapp_leads WHERE jid = ?', [jid]);
        console.log(`✅ Leads deleted: ${(l as any).affectedRows}`);

        const [s] = await pool.execute('DELETE FROM registraya_whatsapp_sessions WHERE jid = ?', [jid]);
        console.log(`✅ Sessions deleted: ${(s as any).affectedRows}`);

        console.log("✨ All clear!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error clearing history:", error);
        process.exit(1);
    }
}

clearHistory("0967491847");
