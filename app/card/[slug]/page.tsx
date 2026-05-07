import type { Metadata } from "next";
import VCardClient from "./VCardClient";
import pool from "@/lib/db";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const slug = (await params).slug;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.activaqr.com';
    const ogImageUrl = `${baseUrl}/api/og-image/${slug}.jpg`;

    try {
        const [rows]: any = await pool.execute(
            'SELECT nombre, bio FROM registraya_vcard_registros WHERE slug = ?',
            [slug]
        );

        if (rows && rows.length > 0) {
            const client = rows[0];
            const name = client.nombre;
            const description = client.bio || `Conéctate con ${name}. Escanea el código QR para guardar mi contacto profesional directamente en tu teléfono.`;

            return {
                metadataBase: new URL(baseUrl),
                title: `${name} | Contacto Digital - ActivaQR`,
                description: description,
                openGraph: {
                    title: `${name} - Contacto Digital ActivaQR`,
                    description: description,
                    url: `${baseUrl}/card/${slug}`,
                    type: 'profile',
                    images: [
                        {
                            url: ogImageUrl,
                            secureUrl: ogImageUrl,
                            width: 1200,
                            height: 630,
                            alt: name,
                            type: 'image/jpeg',
                        },
                    ],
                },
                twitter: {
                    card: 'summary_large_image',
                    title: `${name} - Contacto Digital ActivaQR`,
                    description: description,
                    images: [ogImageUrl],
                }
            };
        }
    } catch (err) {
        console.error('Error generating metadata:', err);
    }

    // Fallback if client not found or error
    const name = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    return {
        metadataBase: new URL(baseUrl),
        title: `${name} | Contacto Digital - ActivaQR`,
        description: `Conéctate con ${name}. Escanea el código QR para guardar mi contacto profesional directamente en tu teléfono.`,
        openGraph: {
            title: `${name} - Contacto Digital ActivaQR`,
            description: `Guarda mi contacto profesional con un solo clic.`,
            url: `${baseUrl}/card/${slug}`,
            type: 'profile',
            images: [
                {
                    url: `${baseUrl}/og-default.png`,
                    width: 800,
                    height: 800,
                    alt: 'ActivaQR',
                    type: 'image/png',
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title: `${name} - Contacto Digital ActivaQR`,
            images: [`${baseUrl}/og-default.png`],
        }
    };
}

export default async function Page({ params }: { params: { slug: string } }) {
    const { slug } = await params;

    try {
        const [rows]: any = await pool.execute(
            'SELECT status FROM registraya_vcard_registros WHERE slug = ? OR id = ?',
            [slug, slug]
        );

        if (rows && rows.length > 0 && rows[0].status === 'cancelado') {
            redirect('/card/activaqr-9ag4');
        }
    } catch (err) {
        console.error('Error in Page server-side check:', err);
    }

    return <VCardClient />;
}
