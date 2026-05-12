import { Metadata } from 'next';
import VentasClient from './VentasClient';

export const metadata: Metadata = {
    title: 'Únete a Ventas | ActivaQR',
    description: 'Gana altas comisiones vendiendo ActivaQR. Únete a nuestro equipo y ofrece una herramienta digital esencial para negocios y profesionales.',
};

export default function VentasPage() {
    return <VentasClient />;
}
