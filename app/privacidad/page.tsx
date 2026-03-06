import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Política de Privacidad | ActivaQR',
    description: 'Política de privacidad y protección de datos de ActivaQR.',
};

export default function PrivacidadPage() {
    return (
        <main className="min-h-screen bg-cream pt-32 pb-20 px-6 font-sans text-navy">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 italic">
                    Política de <span className="text-primary">Privacidad</span>
                </h1>

                <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-navy/5 space-y-6 text-navy/80 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-4">1. Recopilación de Información</h2>
                        <p>
                            Recopilamos información que usted nos proporciona directamente, como cuando crea su contacto digital, se registra para ser vendedor o se comunica con nosotros. Esto incluye su nombre, número de teléfono, ciudad e información profesional.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-4">2. Uso de la Información</h2>
                        <p>
                            Utilizamos la información recopilada para proporcionar, mantener y mejorar nuestros servicios, procesar sus transacciones y enviarle comunicaciones relacionadas con su cuenta o con ActivaQR.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-4">3. Protección de Datos</h2>
                        <p>
                            Implementamos medidas de seguridad diseñadas para proteger su información personal contra pérdida, robo, uso indebido y acceso no autorizado. Sus datos se almacenan en servidores seguros.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-4">4. Compartir Información</h2>
                        <p>
                            No vendemos ni compartimos sus datos personales con terceros para fines comerciales, excepto cuando sea necesario para cumplir con la ley o proteger nuestros derechos.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-navy/5 mt-10">
                        <Link href="/ventas" className="text-primary font-black uppercase tracking-widest hover:underline flex items-center gap-2">
                            ← Volver a Ventas
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
