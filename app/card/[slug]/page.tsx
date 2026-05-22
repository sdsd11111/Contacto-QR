import type { Metadata } from "next";
import VCardClient from "./VCardClient";
import pool from "@/lib/db";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const slug = (await params).slug;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.activaqr.com';

    try {
        // Incluimos foto_url y last_edited_at para generar OG tags más completos
        const [rows]: any = await pool.execute(
            'SELECT nombre, nombre_negocio, tipo_perfil, bio, foto_url, last_edited_at FROM registraya_vcard_registros WHERE slug = ?',
            [slug]
        );

        if (rows && rows.length > 0) {
            const client = rows[0];
            const name = client.tipo_perfil === 'negocio' ? (client.nombre_negocio || client.nombre) : client.nombre;
            const description = client.bio || `Conéctate con ${name}. Escanea el código QR para guardar mi contacto profesional directamente en tu teléfono.`;

            // Generar URL del OG image con versión para romper caché cuando se edita
            const version = client.last_edited_at
                ? new Date(client.last_edited_at).getTime().toString(36)
                : slug.slice(-6);
            const ogImageUrl = `${baseUrl}/api/og-image/${slug}.jpg?v=${version}`;

            const images: any[] = [
                {
                    url: ogImageUrl,
                    secureUrl: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: name,
                    type: 'image/jpeg',
                },
            ];

            // Si foto_url es una URL HTTP directa (no base64), agregarla como respaldo
            // para crawlers que no procesen bien el endpoint intermedio
            if (client.foto_url && client.foto_url.startsWith('http')) {
                images.push({
                    url: client.foto_url,
                    secureUrl: client.foto_url,
                    width: 1200,
                    height: 630,
                    alt: name,
                });
            }

            return {
                metadataBase: new URL(baseUrl),
                title: `${name} | Contacto Digital - ActivaQR`,
                description: description,
                openGraph: {
                    title: `${name} - Contacto Digital ActivaQR`,
                    description: description,
                    url: `${baseUrl}/card/${slug}`,
                    type: 'profile',
                    images,
                },
                twitter: {
                    card: 'summary_large_image',
                    title: `${name} - Contacto Digital ActivaQR`,
                    description: description,
                    images: [ogImageUrl],
                },
                // Forzar generación dinámica para que los crawlers siempre reciban datos frescos
                other: {
                    'og:image:width': '1200',
                    'og:image:height': '630',
                },
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
                    url: `${baseUrl}/images/og-preview.jpg`,
                    width: 1200,
                    height: 630,
                    alt: 'ActivaQR',
                    type: 'image/jpeg',
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title: `${name} - Contacto Digital ActivaQR`,
            images: [`${baseUrl}/images/og-preview.jpg`],
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
