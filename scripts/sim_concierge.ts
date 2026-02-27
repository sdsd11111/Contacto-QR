import { getBotResponse } from '../lib/openai-bot';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function simulate() {
    try {
        console.log("--- TEST ROUND: NEW CONCIERGE FLOW ---");
        const jid = "test_flow_complete";

        let r = await getBotResponse("Hola, quiero hacer el registro de mi QR digital", jid);
        console.log("BOT R1:", r);
        let history = [{ role: 'user', content: "Hola, quiero hacer el registro de mi QR digital" }, { role: 'assistant', content: r }];

        console.log("\n--- SIMULATING USER SENDING BLOCK 1 (PERSON) ---");
        const u2 = "Persona. Me llamo Juan Perez, soy Abogado, no tengo negocio";
        r = await getBotResponse(u2, jid, history);
        console.log("BOT R2:", r);
        history.push({ role: 'user', content: u2 }, { role: 'assistant', content: r });

        console.log("\n--- SIMULATING USER SENDING BLOCK 2 ---");
        const u3 = "Ayudo a personas con problemas legales. Quito. Av Amazonas.";
        r = await getBotResponse(u3, jid, history);
        console.log("BOT R3:", r);
        history.push({ role: 'user', content: u3 }, { role: 'assistant', content: r });

        console.log("\n--- SIMULATING USER SENDING BLOCK 3 ---");
        const u4 = "juan@abogados.com. No tengo web. Mi linkedin es linkedin.com/juan y mi menu digital esta en menu.com/juan";
        r = await getBotResponse(u4, jid, history);
        console.log("BOT R4:", r);

        console.log("\nDid it transfer to support?", r.includes("[TRANSFER_SUPPORT]"));

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

simulate();
