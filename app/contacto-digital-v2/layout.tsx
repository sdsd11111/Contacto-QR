import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contacto Digital | ActivaQR',
    description: '¿Cuántos "maestros" hay en el teléfono de tu cliente? Deja de ser un número sin nombre y conviértete en el profesional que eres.',
};

export default function ContactoDigitalV2Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
