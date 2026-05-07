"use client";

import DemoBuilder from '@/components/DemoBuilder';

const SLIDES = [
    {
        id: '1',
        title: 'HYPE STUDIO',
        description: 'EL ESTÁNDAR DE ORO EN GROOMING',
        portada_desktop: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1920&auto=format&fit=crop',
        portada_movil: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop',
        active: true,
    },
    {
        id: '2',
        title: 'ESTILO & CORTE',
        description: 'FUSIÓN DE TRADICIÓN Y VANGUARDIA',
        portada_desktop: 'https://images.unsplash.com/photo-1621605815841-aa88c82b0ad2?q=80&w=1920&auto=format&fit=crop',
        portada_movil: 'https://images.unsplash.com/photo-1621605815841-aa88c82b0ad2?q=80&w=800&auto=format&fit=crop',
        active: true,
    },
];

export default function HedkandiHypePreview() {
    const data = {
        nombre_negocio: 'HYPE BARBER',
        profesion: 'PREMIUM GROOMING & LIFESTYLE 💈',
        bio: 'Elevamos el arte de la barbería a una experiencia de lujo. En Hype Barber Studio, fusionamos técnicas tradicionales con un estilo vanguardista para que proyectes tu mejor versión.\n\nNuestra misión es brindarte no solo un corte, sino un momento de desconexión y renovación absoluta.',
        slug: 'hype-barber-studio',
        video_url: 'https://www.youtube.com/embed/SOfv6tXF_oE',
        google_maps_url: 'https://maps.app.goo.gl/hypebarber',
        instagram: 'https://instagram.com/hypebarber',
        whatsapp: 'https://wa.me/593987654321',
        facebook: 'https://facebook.com/hypebarber',
        tiktok_url: 'https://tiktok.com/@hypebarber',
        productos_servicios: '✂️ CORTE SIGNATURE\n🧔 PERFILADO DE BARBA\n🧖 FACIAL PURIFICANTE',
        foto_url: 'https://images.unsplash.com/photo-1622286330961-a20a63f6ec5e?q=80&w=400&auto=format&fit=crop',
        portada_desktop: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1920&auto=format&fit=crop',
        portada_movil: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop',
    };

    return (
        <>
            <title>HYPE BARBER STUDIO | Premium vCard</title>
            <DemoBuilder
                template="hedkandi"
                data={data}
                slides={SLIDES}
                onSaveContact={() => console.log('Descargando VCF Hype Barber...')}
            />
        </>
    );
}
