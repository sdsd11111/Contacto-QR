import type { Metadata } from "next";
import VCardClient from "./VCardClient";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const slug = (await params).slug;
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
