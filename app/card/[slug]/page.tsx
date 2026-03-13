import type { Metadata } from "next";
import VCardClient from "./VCardClient";
import pool from "@/lib/db";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const slug = (await params).slug;

    try {
        const [rows]: any = await pool.execute(
            'SELECT nombre, bio, foto_url FROM registraya_vcard_registros WHERE slug = ?',
            [slug]
        );

        if (rows && rows.length > 0) {
            const client = rows[0];
            const name = client.nombre;
            const description = client.bio || `Conéctate con ${name}. Escanea el código QR para guardar mi contacto profesional directamente en tu teléfono.`;
            const image = client.foto_url || 'https://activaqr.com/og-default.png';

            return {
                title: `${name} | Contacto Digital - ActivaQR`,
                description: description,
                openGraph: {
                    title: `${name} - Contacto Digital ActivaQR`,
                    description: description,
                    type: 'profile',
                    images: [
                        {
                            url: image,
                            width: 800,
                            height: 800,
                            alt: name,
                        },
                    ],
                }
            };
        }
    } catch (err) {
        console.error('Error generating metadata:', err);
    }

    // Fallback if client not found or error
    const name = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    return {
        title: `${name} | Contacto Digital - ActivaQR`,
        description: `Conéctate con ${name}. Escanea el código QR para guardar mi contacto profesional directamente en tu teléfono.`,
        openGraph: {
            title: `${name} - Contacto Digital ActivaQR`,
            description: `Guarda mi contacto profesional con un solo clic.`,
            type: 'profile',
        }
    };
}

export default function Page() {
    return <VCardClient />;
}
