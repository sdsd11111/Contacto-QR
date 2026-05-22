import { Metadata } from 'next';
import ContratoOnboardingClient from '@/components/contrato/ContratoOnboardingClient';

export const metadata: Metadata = {
    title: 'Contrato Digital | ActivaQR',
    description: 'Firma tu contrato de servicios ActivaQR. Proceso seguro con respaldo legal.',
};

/**
 * Página de Contrato y Onboarding de Cliente
 * 
 * Ruta: /contrato/[uuid]
 * 
 * Cada contrato tiene un UUID único vinculado a un cliente + producto específico.
 * Un cliente puede tener múltiples contratos (uno por producto).
 * 
 * La página maneja 3 secciones en una sola URL:
 * 1. Formulario de datos del cliente
 * 2. Contrato generado dinámicamente (se rellena en tiempo real con los datos)
 * 3. Firma digital con metadatos forenses (IP, geolocalización, fingerprint)
 */
export default async function ContratoPage({
    params,
}: {
    params: Promise<{ uuid: string }>;
}) {
    const { uuid } = await params;

    // Validar UUID en servidor
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
        return (
            <main className="min-h-screen bg-cream flex items-center justify-center px-6">
                <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-navy/5 shadow-xl text-center max-w-lg">
                    <div className="text-5xl mb-4">🔗</div>
                    <h1 className="text-2xl font-black text-navy uppercase mb-3">Enlace inválido</h1>
                    <p className="text-navy/70 font-medium mb-4">
                        El enlace del contrato no es válido. Por favor, solicita un nuevo enlace a tu asesor.
                    </p>
                </div>
            </main>
        );
    }

    return <ContratoOnboardingClient contratoId={uuid} />;
}
