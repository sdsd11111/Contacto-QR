
async function run() {
    try {
        const { getBotResponse } = await import('./lib/openai-bot.js');

        const jid = "test_jid_flow";
        console.log("--- STARTING CONCIERGE SIMULATION ---");

        let msg = "quiero mi qr";
        console.log("USER:", msg);
        let r1 = await getBotResponse(msg, jid);
        console.log("BOT R1:", r1);

        let history = [{ role: 'user', content: msg }, { role: 'assistant', content: r1 }];

        msg = "Persona. Soy Juan Perez, Abogado. No tengo negocio.";
        console.log("\nUSER:", msg);
        let r2 = await getBotResponse(msg, jid, history);
        console.log("BOT R2:", r2);
        history.push({ role: 'user', content: msg }, { role: 'assistant', content: r2 });

        msg = "Loja. Bio de prueba abogado. Sin direccion";
        console.log("\nUSER:", msg);
        let r3 = await getBotResponse(msg, jid, history);
        console.log("BOT R3:", r3);
        history.push({ role: 'user', content: msg }, { role: 'assistant', content: r3 });

        msg = "juan@test.com. sin web. mi menu digital: hola.com. redes: no uso";
        console.log("\nUSER:", msg);
        let r4 = await getBotResponse(msg, jid, history);
        console.log("BOT R4:", r4);

        if (r4.includes("[TRANSFER_SUPPORT]")) {
            console.error("\n❌ ERROR: Transferring to support when it shouldn't!");
        } else {
            console.log("\n✅ SUCCESS: No support transfer at completion.");
            const hasLink = r4.includes("www.activaqr.com/registro");
            console.log(`✅ SUCCESS: Contains magic link? ${hasLink}`);
        }

    } catch (e) {
        console.error(e);
    }
}

run();
