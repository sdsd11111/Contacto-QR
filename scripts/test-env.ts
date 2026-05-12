import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

console.log("Checking environment variables...");
console.log("DEEPSEEK_API_KEY:", process.env.DEEPSEEK_API_KEY ? "EXISTS (starts with " + process.env.DEEPSEEK_API_KEY.substring(0, 5) + ")" : "MISSING");
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "EXISTS (starts with " + process.env.OPENAI_API_KEY.substring(0, 8) + ")" : "MISSING");
console.log("MYSQL_HOST:", process.env.MYSQL_HOST || "MISSING");
console.log("CWD:", process.cwd());
console.log("Path resolved:", resolve(process.cwd(), '.env.local'));
