import pool from '../lib/db';

async function run() {
    try {
        const [schema]: any = await pool.query('DESCRIBE registraya_vcard_registros');
        const planField = schema.find((r: any) => r.Field === 'plan');
        console.log('Schema plan:', planField);

        const [countRows]: any = await pool.query('SELECT COUNT(*) as total from registraya_vcard_registros where plan = "pro"');
        console.log('Pro count:', countRows[0].total);

        // Update them
        const [updateResult]: any = await pool.query('UPDATE registraya_vcard_registros SET plan = "digital" WHERE plan = "pro"');
        console.log('Updated:', updateResult.affectedRows);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
