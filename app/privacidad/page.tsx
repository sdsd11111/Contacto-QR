import { Metadata } from 'next';
import Link from 'next/link';
import PrivacidadForm from './PrivacidadForm';

export const metadata: Metadata = {
    title: 'Política de Privacidad | ActivaQR',
    description: 'Política de privacidad y tratamiento de datos de ActivaQR.',
};

export default function PrivacidadPage() {
    return (
        <main className="min-h-screen bg-cream pt-32 pb-20 px-6 font-sans text-navy">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 italic">
                    Política de <span className="text-primary">Privacidad</span>
                </h1>

                <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-navy/5 space-y-8 text-navy/80 leading-relaxed font-medium">
                    <div className="mb-6 pb-6 border-b border-navy/10">
                        <h2 className="text-2xl font-black text-navy uppercase mb-2">📜 Política de Privacidad y Tratamiento de Datos</h2>
                        <p className="text-sm font-bold text-primary uppercase tracking-widest">(Capa 1 - Informativa)</p>
                    </div>

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">1. Identidad del Responsable</h2>
                        <p>
                            ActivaQR, operada por el Grupo Empresarial Reyes, con domicilio legal en [Dirección Física en Ecuador], teléfono [Número] y correo electrónico [Email de Soporte], es el Responsable del tratamiento de tus datos personales.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">2. ¿Para qué usamos tu información? (Finalidades)</h2>
                        <p className="mb-2">Tus datos (nombre, teléfono y correo) serán tratados estrictamente para:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Gestión de Identidad Digital:</strong> Entrega de nuestra VCard y registro en nuestra agenda de contactos de élite.</li>
                            <li><strong>Notificaciones de Valor:</strong> Envío de cotizaciones, actualizaciones de herramientas tecnológicas y casos de éxito comerciales vía WhatsApp y email.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">3. Base Legal y Transferencia Internacional</h2>
                        <p>
                            Este tratamiento se basa en tu consentimiento libre e inequívoco. Te informamos que, para asegurar la sincronización de tu contacto, realizaremos una transferencia internacional de datos a los servidores de Google (USA), donde se aloja nuestra infraestructura de contactos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">4. Tiempo de Conservación</h2>
                        <p>
                            Conservaremos tu información mientras dure nuestra relación comercial o hasta que solicites su eliminación, con un plazo máximo de revisión periódica de cada 2 años para asegurar la pertinencia del dato.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">5. Tus Derechos (ARCO+PAL)</h2>
                        <p>
                            Como titular, tienes control total sobre tus datos. Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación/Eliminación, Oposición, Portabilidad, Anonimización y Limitación (ARCO+PAL) escribiendo a [Email de Soporte].
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">6. Revocatoria y "BAJA" Tecnológica</h2>
                        <p>
                            Puedes retirar tu consentimiento en cualquier momento sin justificación. Nuestro software está diseñado bajo el principio de Protección de Datos desde el Diseño, permitiéndote escribir la palabra <strong>"BAJA"</strong> en nuestro chat de WhatsApp. Nuestro sistema ejecutará un bloqueo técnico inmediato, garantizando el cese de comunicaciones comerciales en milisegundos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">7. Política Completa</h2>
                        <p>
                            Para conocer los 17 puntos informativos exigidos por el Art. 12 de la LOPDP, accede a nuestra Política de Privacidad Completa aquí: <Link href="#" className="text-primary hover:underline font-bold">[Link a Capa 2]</Link>.
                        </p>
                    </section>

                    <div className="pt-8 mt-10">
                        <PrivacidadForm />
                    </div>

                    <div className="pt-8 border-t border-navy/5 mt-10">
                        <Link href="/" className="text-primary font-black uppercase tracking-widest hover:underline flex items-center gap-2">
                            ← Volver al Inicio
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
