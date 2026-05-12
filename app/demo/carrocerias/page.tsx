import React from 'react';
import DemoBuilder from '@/components/DemoBuilder';

export default function CarroceriasDemoPage() {
    const demoData = {
        nombre_negocio: 'Carrocerías Martinelli',
        profesion: 'Fabricación & Reparación de Carrocerías',
        bio: 'Somos líderes en fabricación de carrocerías para vehículos de carga y transporte. Con más de 15 años en el mercado, ofrecemos soluciones personalizadas con materiales de primera calidad y garantía total en cada trabajo entregado.',
        whatsapp: '+593991234567',
        email: 'ventas@martinelli.com',
        address: 'Av. Industrial Km 3.5, Quito, Ecuador',
        portada_desktop: 'https://images.unsplash.com/photo-1625902254942-5b6c0c34c57f?q=80&w=2070&auto=format&fit=crop',
        portada_movil: 'https://images.unsplash.com/photo-1625902254942-5b6c0c34c57f?q=80&w=800&auto=format&fit=crop',
        foto_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop',
        instagram: 'https://instagram.com/carrocerias_martinelli',
        facebook: 'https://facebook.com/carrocerias.martinelli',
        productos_servicios: [
            'Carrocerías para camiones de carga',
            'Reparación y enderezada de carrocería',
            'Pintura automotriz industrial',
            'Instalación de plataformas y volquetes',
            'Fabricación de furgones refrigerados',
            'Mantenimiento preventivo de flota',
        ].join('\n'),
        catalogo_json: {
            categories: ['Carrocerías 0KM', 'Vigas Carrozadas', 'Usados', 'Reparaciones'],
            products: [
                { id: '1', name: 'Carrocería Premium Kenworth', category: 'Carrocerías 0KM', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800&auto=format&fit=crop', price: 'Consultar', description: 'Carrocería de acero estructural de alta resistencia. Capacidad de carga hasta 35 toneladas.' },
                { id: '2', name: 'Furgón Refrigerado Mercedes', category: 'Carrocerías 0KM', image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=800&auto=format&fit=crop', price: 'Consultar', description: 'Furgón con aislamiento térmico de alta eficiencia.' },
                { id: '3', name: 'Plataforma Articulada Scania', category: 'Vigas Carrozadas', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop', price: 'Consultar', description: 'Plataforma articulada para transporte de maquinaria pesada.' },
                { id: '4', name: 'Camión Volquete Iveco', category: 'Usados', image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=800&auto=format&fit=crop', price: 'Desde $25.000', description: 'Camión volquete en excelente estado.' },
                { id: '5', name: 'Reparación Estructura Completa', category: 'Reparaciones', image: 'https://images.unsplash.com/photo-1504307651254-35680f356f12?q=80&w=800&auto=format&fit=crop', price: 'Cotizar', description: 'Servicio completo de reparación estructural.' },
                { id: '6', name: 'Carrocería Viga en V', category: 'Vigas Carrozadas', image: 'https://images.unsplash.com/photo-1625902254942-5b6c0c34c57f?q=80&w=800&auto=format&fit=crop', price: 'Consultar', description: 'Carrocería tipo viga en V para carga extradimensional.' },
            ],
        },
    };

    return <DemoBuilder template="carrocerias" data={demoData} />;
}
