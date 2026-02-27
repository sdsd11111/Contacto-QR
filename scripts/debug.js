
"use strict";
// Use dynamic imports to bypass CJS/ESM mixing if possible
async function run() {
    try {
        const { getBotResponse } = await import('./lib/openai-bot.js');
        const res = await getBotResponse("Hola", "test");
        console.log(res);
    } catch (e) {
        console.error(e);
    }
}
run();
