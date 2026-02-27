
import { getBotResponse } from './lib/openai-bot.js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function test() {
    try {
        console.log("--- TEST 1: First greeting ---");
        const r1 = await getBotResponse("Hola, quiero mi QR", "test_jid_1");
        console.log("R1:", r1);

        console.log("\n--- TEST 2: Second turn (should NOT greet again) ---");
        const history = [{ role: 'user', content: "Hola, quiero mi QR" }, { role: 'assistant', content: r1 }];
        const r2 = await getBotResponse("Me llamo Cristhopher, soy peluquero independiente", "test_jid_1", history);
        console.log("R2:", r2);

    } catch (err) {
        console.error("Test error:", err);
    }
    process.exit(0);
}

test();
