import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { saveToGoogleContacts } from '../lib/google-contacts.ts';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function test() {
    console.log('Testing saveToGoogleContacts...');
    const result = await saveToGoogleContacts('Test User Antigravity', '593967491847');
    console.log('Result:', result ? 'SUCCESS' : 'FAILED');
}

test().then(() => process.exit(0));
