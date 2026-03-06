import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Términos y Condiciones | ActivaQR',
    description: 'Términos y condiciones de uso de la plataforma ActivaQR.',
};

export default function TerminosPage() {
    return (
        <main className="min-h-screen bg-cream pt-32 pb-20 px-6 font-sans text-navy">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 italic">
                    Términos y <span className="text-primary">Condiciones</span>
                </h1>

                <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-navy/5 space-y-6 text-navy/80 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-4">1. Aceptación de los Términos</h2>
                        <p>
                            Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos términos y condiciones de uso, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales aplicables.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-4">2. Uso de la Plataforma</h2>
                        <p>
                            ActivaQR proporciona una herramienta para la creación de contactos digitales. El usuario es responsable de la veracidad de la información proporcionada y del uso ético de la plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-4">3. Limitación de Responsabilidad</h2>
                        <p>
                            ActivaQR no será responsable de ningún daño que surja del uso o la imposibilidad de usar los materiales en su sitio web, incluso si ActivaQR o un representante autorizado ha sido notificado verbalmente o por escrito de la posibilidad de tales daños.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-4">4. Modificaciones</h2>
                        <p>
                            ActivaQR puede revisar estos términos de servicio para su sitio web en cualquier momento sin previo aviso. Al utilizar este sitio web, usted acepta estar sujeto a la versión actual de estos términos de servicio.
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
