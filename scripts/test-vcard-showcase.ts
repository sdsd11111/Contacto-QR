import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedTestShowcase() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log("Conectando a la base de datos...");
        
        const galleryUrls = JSON.stringify([
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1600607687931-570a3c9be081?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ]);

        const [result] = await pool.execute(`
            INSERT INTO registraya_vcard_registros 
            (id, slug, nombre_negocio, profesion, bio, whatsapp, email, direccion, web, 
             instagram, linkedin, productos_servicios, portada_desktop, foto_url, galeria_urls, template_id, status)
            VALUES 
            (UUID(), 'test-showcase', 'AURA ARCHITECTURE', 'HIGH-END RESIDENTIAL DESIGN', 
            'Aura is an award-winning architecture studio based in Vancouver. We create timeless, sophisticated spaces that elevate the everyday living experience.', 
            '+1234567890', 'hello@aura-arch.com', '123 Luxury Ave, Vancouver, BC', 'https://aura-arch.com',
            'https://instagram.com/aura_arch', 'https://linkedin.com/company/aura', 
            'Interior Design\nArchitectural Planning\nLandscape Design\nProject Management',
            'https://images.unsplash.com/photo-1600607687644-c7171b42498f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            ?, 'showcase', 'pagado')
            ON DUPLICATE KEY UPDATE 
            template_id = 'showcase', 
            galeria_urls = VALUES(galeria_urls),
            portada_desktop = VALUES(portada_desktop)
        `, [galleryUrls]);

        console.log("✅ Perfil de prueba 'test-showcase' insertado/actualizado exitosamente!");
        
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await pool.end();
    }
}

seedTestShowcase();
