const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Explicit credentials for migration (taken from previous .env.local state)
const SUPABASE_URL = "https://ilhgwqgouwomehgxivbo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsaGd3cWdvdXdvbWVoZ3hpdmJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIzODU0MiwiZXhwIjoyMDg1ODE0NTQyfQ.FLu-Z2F85-xdpmjuScwzjfbvGp1op5ba0t1qeDbmOSg"; // Service Role Key

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: Supabase credentials missing.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function backupData() {
    console.log('Starting backup from Supabase...');

    // Fetch all data from the main table
    const { data, error } = await supabase
        .from('registraya_vcard_registros')
        .select('*');

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    console.log(`Retrieved ${data.length} records.`);

    const backupPath = path.join(__dirname, '..', 'backup_supabase_data.json');
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
    console.log(`Backup saved to ${backupPath}`);
}

backupData();
