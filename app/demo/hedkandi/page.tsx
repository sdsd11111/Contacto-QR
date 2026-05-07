"use client";

import DemoBuilder from '@/components/DemoBuilder';

export default function HedkandiPreview() {
    const data = {
        nombre_negocio: 'Luce Bella',
        profesion: 'Salón de Belleza & Spa ✨',
        bio: 'Somos Luce Bella Peluquería Unisex, un espacio de belleza en Loja enfocado en el cuidado personal y la imagen de nuestros clientes. Ofrecemos servicios de peluquería para hombres y mujeres, brindando atención personalizada para resaltar tu estilo y mejorar tu apariencia. Nuestro compromiso es ayudarte a verte y sentirte bien, con un servicio cercano, práctico y adaptado a lo que necesitas.',
        slug: 'luce-bella-0lrf',
        video_url: 'https://www.tiktok.com/@estilonunisex.loja/video/7467600917789936914',
        google_maps_url: 'https://maps.app.goo.gl/estilonunisex',
        instagram: 'https://instagram.com/estilonunisex.loja',
        whatsapp: 'https://wa.me/593987654321',
        facebook: 'https://facebook.com/lucebellaloja',
        tiktok_url: 'https://tiktok.com/@estilonunisex.loja',
        productos_servicios: '✂️ Peluquería unisex\n🎨 Tratamientos capilares\n💅 Servicios de belleza',
    };

    return (
        <DemoBuilder
            template="hedkandi"
            data={data}
            onSaveContact={() => console.log('Descargando VCF Luce Bella...')}
        />
    );
}
