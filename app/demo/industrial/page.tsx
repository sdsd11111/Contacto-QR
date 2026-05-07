import React from 'react';
import DemoBuilder from '@/components/DemoBuilder';

export default function IndustrialDemoPage() {
    const mockData = {
        nombre_negocio: 'Nexus Global Logistics',
        profesion: 'Operador Logístico 3PL',
        bio: 'Especialistas en transporte de carga pesada y distribución a nivel nacional. Monitoreo 24/7 y garantía de entrega segura para flotas industriales y retail.',
        whatsapp: '+593991234567',
        email: 'operaciones@nexus-logistics.com',
        address: 'Av. Las Industrias Km 4.5, Quito, Ecuador',
        portada_desktop: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=2070&auto=format&fit=crop',
        portada_movil: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=800&auto=format&fit=crop',
        foto_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800&auto=format&fit=crop',
        instagram: 'https://instagram.com/nexuslogistics',
        facebook: 'https://facebook.com/nexuslogistics',
        video_url: 'https://www.youtube.com/watch?v=xSxC6RUeSHo',
        productos_servicios: [
            'Transporte de carga pesada',
            'Distribución de última milla',
            'Almacenamiento aduanero',
            'Gestión de flotas críticas',
            'Logística inversa',
        ].join('\n'),
        catalogo_json: {
            categories: ['Nuestra Flota', 'Centros de Distribución'],
            products: [
                { id: '1', name: 'Tractocamión Kenworth T800', category: 'Nuestra Flota', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800&auto=format&fit=crop', description: 'Unidad de alto rendimiento para carga extrapesada con rastreo satelital activo.' },
                { id: '2', name: 'Furgón Refrigerado 15T', category: 'Nuestra Flota', image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=800&auto=format&fit=crop', description: 'Transporte temperatura controlada para productos perecederos.' },
                { id: '3', name: 'Centro Logístico Norte', category: 'Centros de Distribución', image: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c30a80?q=80&w=800&auto=format&fit=crop', description: 'Más de 5000m² de almacenamiento con seguridad privada.' },
                { id: '4', name: 'Camión Plataforma 20T', category: 'Nuestra Flota', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop', description: 'Ideal para maquinaria pesada y carga sobredimensionada.' },
            ],
        },
    };

    return <DemoBuilder template="industrial" data={mockData} />;
}
