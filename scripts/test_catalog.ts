import { getBotResponse } from '../lib/openai-bot';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Mock DB pool to avoid connecting
jest?.mock('../lib/db', () => ({
    __esModule: true,
    default: {
        execute: async () => [[]]
    }
}));

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function runTests() {
    process.env.DEEPSEEK_API_KEY = process.env.OPENAI_API_KEY; // ensuring we have a key
    
    console.log("=== TEST 1: Direct Catalog Purchase (1 Person) ===");
    console.log("User: Quiero el plan pro de 20$");
    const r1 = await getBotResponse("quiero el plan pro de 20$", "test_jid_catalog_1");
    console.log("Bot:", r1);
    console.log("Checks:");
    console.log("- NO SAVE_VCF_ONLY?", !r1.includes("[SAVE_VCF_ONLY]"));
    console.log("- NO TRANSFER?", !r1.includes("[TRANSFER_SUPPORT]"));

    console.log("\n=== TEST 2: Direct Catalog Purchase (>1 Person) ===");
    console.log("User: quiero el plan business de 60 dólares para 5 empleados");
    const r2 = await getBotResponse("quiero el plan business de 60 dólares para 5 empleados", "test_jid_catalog_2");
    console.log("Bot:", r2);
    console.log("Checks:");
    console.log("- TRANSFER_SUPPORT?", r2.includes("[TRANSFER_SUPPORT]"));
    console.log("- NO SAVE_VCF_ONLY?", !r2.includes("[SAVE_VCF_ONLY]"));

    console.log("\n=== TEST 3: Informational Question (General) ===");
    console.log("User: que es contacto digital?");
    const r3 = await getBotResponse("que es contacto digital?", "test_jid_catalog_3");
    console.log("Bot:", r3);
    console.log("Checks:");
    console.log("- SAVE_VCF_ONLY?", r3.includes("[SAVE_VCF_ONLY]"));

    process.exit(0);
}

runTests();
