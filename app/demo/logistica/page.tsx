import React from 'react';
import DemoBuilder from '@/components/DemoBuilder';

export default function LogisticaDemoPage() {
    const demoData = {
        nombre_negocio: 'Nexus Logistics Group',
        profesion: 'Soluciones Globales de Transporte',
        bio: 'Lideramos la cadena de suministro con tecnología de punta y una flota moderna. Garantizamos entregas seguras y a tiempo en todo el territorio nacional, optimizando costos y tiempos de operación para su empresa.',
        whatsapp: '+593991234567',
        email: 'operaciones@nexus-logistics.com',
        address: 'Terminal de Carga, Módulo 5, Guayaquil',
        portada_desktop: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c80a30?q=80&w=2070&auto=format&fit=crop',
        portada_movil: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c80a30?q=80&w=800&auto=format&fit=crop',
        foto_url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=800&auto=format&fit=crop',
        productos_servicios: [
            'Transporte de Carga Pesada',
            'Logística de Última Milla',
            'Almacenamiento y Distribución',
            'Gestión de Inventarios',
            'Seguimiento Satelital 24/7',
            'Seguro de Carga Integral',
        ].join('\n'),
    };

    return <DemoBuilder template="industrial" data={demoData} />;
}
