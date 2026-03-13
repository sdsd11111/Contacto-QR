import type { Metadata } from "next";
import VCardClient from "@/app/card/[slug]/VCardClient";
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
            const description = `Explora el catálogo de productos y servicios de ${name}. ${client.bio || ''}`;
            const image = client.foto_url || 'https://activaqr.com/og-default.png';

            return {
                title: `${name} - Catálogo de Productos | ActivaQR`,
                description: description,
                openGraph: {
                    title: `${name} - Catálogo Interactivo`,
                    description: description,
                    type: 'website',
                    images: [
                        {
                            url: image,
                            width: 800,
                            height: 800,
                            alt: `Catálogo de ${name}`,
                        },
                    ],
                }
            };
        }
    } catch (err) {
        console.error('Error generating metadata:', err);
    }

    const name = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    return {
        title: `${name} - Catálogo de Productos | ActivaQR`,
        description: `Explora el catálogo de productos y servicios de ${name}.`,
        openGraph: {
            title: `${name} - Catálogo`,
            description: `Catálogo interactivo de productos y servicios.`,
            type: 'website',
        }
    };
}

export default function CatalogPage() {
    return <VCardClient showCatalog={true} />;
}
