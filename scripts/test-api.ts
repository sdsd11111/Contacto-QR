import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import OpenAI from 'openai';

async function testApi() {
    console.log("=== Testing DeepSeek API ===");
    try {
        const dsKey = process.env.DEEPSEEK_API_KEY;
        if (!dsKey) {
            console.log("DEEPSEEK_API_KEY is missing from .env.local");
        } else {
            console.log(`DEEPSEEK_API_KEY found: ${dsKey.substring(0, 5)}...`);
            const dsClient = new OpenAI({
                baseURL: 'https://api.deepseek.com',
                apiKey: dsKey,
            });
            
            const dsResponse = await dsClient.chat.completions.create({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: 'Say "hola"' }],
                max_tokens: 10
            });
            console.log("DeepSeek Response:", dsResponse.choices[0].message.content);
        }
    } catch (e: any) {
        if (e.status) {
            console.error(`DeepSeek API Error: ${e.status} - ${e.error?.message || e.message}`);
        } else {
            console.error("DeepSeek unexpected error:", e);
        }
    }

    console.log("\n=== Testing OpenAI API ===");
    try {
        const oaKey = process.env.OPENAI_API_KEY;
        if (!oaKey) {
            console.log("OPENAI_API_KEY is missing from .env.local");
        } else {
            console.log(`OPENAI_API_KEY found: ${oaKey.substring(0, 8)}...`);
            const oaClient = new OpenAI({
                apiKey: oaKey,
                // no baseURL, use default OpenAI
            });
            
            const oaResponse = await oaClient.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Say "hola"' }],
                max_tokens: 10
            });
            console.log("OpenAI Response:", oaResponse.choices[0].message.content);
        }
    } catch (e: any) {
        if (e.status) {
            console.error(`OpenAI Error: ${e.status} - ${e.error?.message || e.message}`);
        } else {
            console.error("OpenAI unexpected error:", e);
        }
    }
}

testApi();
