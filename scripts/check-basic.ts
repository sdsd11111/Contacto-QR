
import pool from './lib/db';

async function checkBasicRecords() {
    try {
        const [rows]: any = await pool.execute(
            'SELECT id, nombre, plan, productos_servicios, etiquetas FROM registraya_vcard_registros WHERE plan = "basic" OR plan IS NULL LIMIT 20'
        );
        console.log('Records with plan basic or NULL:');
        rows.forEach((r: any) => {
            console.log(`ID: ${r.id}, Name: ${r.nombre}, Plan: ${r.plan}, Prod: ${r.productos_servicios ? 'YES' : 'NO'}, Tags: ${r.etiquetas ? 'YES' : 'NO'}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkBasicRecords();
