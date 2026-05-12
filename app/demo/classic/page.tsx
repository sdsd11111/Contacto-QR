"use client";

import DemoBuilder from '@/components/DemoBuilder';

const SLIDES = [
    {
        id: '1',
        title: 'DISEÑO CLÁSICO',
        description: 'FUNCIONALIDAD Y ELEGANCIA ATEMPORAL',
        portada_desktop: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920&auto=format&fit=crop',
        portada_movil: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
        active: true,
    },
    {
        id: '2',
        title: 'TU MARCA, TU ESTILO',
        description: 'LA MEJOR PRESENTACIÓN PARA TU NEGOCIO',
        portada_desktop: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1920&auto=format&fit=crop',
        portada_movil: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop',
        active: true,
    },
];

export default function ClassicPreview() {
    const data = {
        nombre: 'JUAN PÉREZ',
        nombre_negocio: 'SOLUCIONES PRO',
        profesion: 'CONSULTOR ESTRATÉGICO 💼',
        bio: 'Especialista en optimización de procesos y transformación digital. Ayudamos a empresas a alcanzar su máximo potencial a través de estrategias innovadoras y soluciones personalizadas.\n\nNuestra trayectoria garantiza resultados medibles y un crecimiento sostenido para tu organización.',
        slug: 'classic-demo',
        video_url: 'https://www.youtube.com/embed/SOfv6tXF_oE',
        google_maps_url: 'https://maps.app.goo.gl/classic',
        instagram: 'https://instagram.com/classic',
        whatsapp: '593987654321',
        email: 'contacto@solucionespro.com',
        facebook: 'https://facebook.com/classic',
        tiktok: 'https://tiktok.com/@classic',
        productos_servicios: '🎯 ASESORÍA EMPRESARIAL\n📈 ANÁLISIS DE MERCADO\n💻 TRANSFORMACIÓN DIGITAL',
        foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
        portada_desktop: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920&auto=format&fit=crop',
        portada_movil: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
        celular: '0987654321',
        direccion: 'Av. Amazonas y Naciones Unidas, Quito',
        theme_primary: '#F66739',
        theme_text_on_primary: '#FFFFFF',
        extracted_bg: '#050510'
    };

    return (
        <>
            <title>SOLUCIONES PRO | Activa Clásico</title>
            <DemoBuilder
                template="classic"
                data={data}
                slides={SLIDES}
                onSaveContact={() => console.log('Descargando VCF Classic...')}
            />
        </>
    );
}
