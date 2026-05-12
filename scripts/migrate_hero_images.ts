import 'dotenv/config';
import pool from '../lib/db';

async function main() {
    try {
        console.log('Adding new columns `portada_desktop` and `portada_movil` to registraya_vcard_registros...');

        // Añadir columnas para las imágenes del hero
        await pool.query(`
            ALTER TABLE registraya_vcard_registros 
            ADD COLUMN portada_desktop VARCHAR(500) DEFAULT NULL,
            ADD COLUMN portada_movil VARCHAR(500) DEFAULT NULL;
        `);

        console.log('Columns added successfully.');

        // Opcionalmente podemos probar insertando datos dummy para el slug actual 'activaqr-9ag4'
        const slug = 'activaqr-9ag4';
        const dummyDesktopUrl = "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80"; // Ejemplo genérico oscuro corporativo
        const dummyMovilUrl = "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";   // Ejemplo móvil

        console.log(`Setting dummy images for slug '${slug}' for testing...`);
        await pool.query(`
            UPDATE registraya_vcard_registros
            SET portada_desktop = ?, portada_movil = ?
            WHERE slug = ?
        `, [dummyDesktopUrl, dummyMovilUrl, slug]);

        console.log('Dummy images set successfully.');


    } catch (error: any) {
        // Ignorar el error si la columna ya existe
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('The columns already exist.');
        } else {
            console.error('Error during migration:', error);
        }
    } finally {
        await pool.end();
        process.exit(0);
    }
}

main();
