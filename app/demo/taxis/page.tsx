import React from 'react';
import DemoBuilder from '@/components/DemoBuilder';

export default function TaxisDemoPage() {
    const demoData = {
        nombre_negocio: 'Elite Taxi Fleet',
        profesion: 'Transporte Ejecutivo & VIP',
        bio: 'Su seguridad y puntualidad son nuestra prioridad. Contamos con una flota de vehículos de alta gama, conductores profesionales y monitoreo GPS constante para brindarle el mejor servicio de transporte en la ciudad.',
        whatsapp: '+593991234567',
        email: 'contacto@elitetaxi.com',
        address: 'Quito, Ecuador - Cobertura Nacional',
        portada_desktop: 'https://images.unsplash.com/photo-1549862214-b15093557e53?q=80&w=2070&auto=format&fit=crop',
        portada_movil: 'https://images.unsplash.com/photo-1549862214-b15093557e53?q=80&w=800&auto=format&fit=crop',
        foto_url: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?q=80&w=800&auto=format&fit=crop',
    };

    return <DemoBuilder template="hedkandi" data={demoData} />;
}
