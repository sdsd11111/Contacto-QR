import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Auditoría Operativa | ActivaQR',
    description: '¿Qué pasa ahora mismo en tu negocio? Sabe exactamente qué pasó, quién estaba y con qué evidencia — sin preguntarle a nadie.',
};

export default function AuditoriaOperativaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
