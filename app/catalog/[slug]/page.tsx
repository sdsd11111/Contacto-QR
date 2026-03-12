import type { Metadata } from "next";
import VCardClient from "@/app/card/[slug]/VCardClient";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const slug = (await params).slug;
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
