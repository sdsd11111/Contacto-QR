import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Política de Privacidad | ActivaQR',
    description: 'Política de privacidad integral y tratamiento de datos de ActivaQR.',
};

export default function PrivacidadPage() {
    return (
        <main className="min-h-screen bg-cream pt-32 pb-20 px-6 font-sans text-navy">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 italic">
                    Política de <span className="text-primary">Privacidad Integral</span>
                </h1>

                <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-navy/5 space-y-10 text-navy/80 leading-relaxed font-medium">

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">1. Identidad del Responsable del Tratamiento</h2>
                        <p>
                            César Augusto Reyes Jaramillo, con domicilio legal en las calles Juan José Peña 1181 y Mercadillo, Loja - Ecuador, teléfono +593963410409 y correo electrónico negocios@cesarreyesjaramillo.com, es el Responsable del tratamiento de tus datos personales bajo la plataforma ActivaQR.
                        </p>
                    </section>

                    <hr className="border-navy/10" />

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">2. Finalidades del Tratamiento</h2>
                        <p className="mb-2">Tus datos personales son tratados exclusivamente para:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Gestión de Identidad Digital:</strong> Creación, personalización y entrega de tu VCard digital; registro en la agenda de contactos comercial del cliente que te compartió el código QR.</li>
                            <li><strong>Notificaciones de Valor:</strong> Envío de cotizaciones, actualizaciones sobre herramientas tecnológicas y casos de éxito comerciales vía WhatsApp y correo electrónico.</li>
                        </ul>
                    </section>

                    <hr className="border-navy/10" />

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">3. Base Legal del Tratamiento</h2>
                        <p>
                            El tratamiento de tus datos se fundamenta en tu consentimiento libre, específico, informado e inequívoco, otorgado al completar el formulario de activación (Art. 7.1 de la LOPDP). Para clientes con relación contractual activa, aplica adicionalmente la base de ejecución de medidas precontractuales o contractuales (Art. 7.5 LOPDP).
                        </p>
                    </section>

                    <hr className="border-navy/10" />

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">4. Tipos de Tratamiento Realizados</h2>
                        <p>
                            Sobre tus datos realizamos las siguientes operaciones: recolección, registro, almacenamiento, estructuración, consulta, comunicación y transferencia internacional hacia la infraestructura de alojamiento declarada.
                        </p>
                    </section>

                    <hr className="border-navy/10" />

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">5. Tiempo de Conservación</h2>
                        <p>
                            Conservaremos tu información mientras dure la relación comercial o hasta que solicites su eliminación. Realizamos revisiones periódicas cada 2 años para verificar la pertinencia de los datos almacenados. Una vez concluida la relación y vencido el plazo de revisión, los datos serán eliminados de forma definitiva.
                        </p>
                    </section>

                    <hr className="border-navy/10" />

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">6. Origen de los Datos</h2>
                        <p>
                            Los datos son obtenidos directamente del titular a través del escaneo del código QR y la interacción con el formulario de activación del sistema ActivaQR.
                        </p>
                    </section>

                    <hr className="border-navy/10" />

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">7. Existencia de Base de Datos</h2>
                        <p>
                            Tus datos forman parte de la base de datos denominada &ldquo;Contactos ActivaQR&rdquo;, de uso comercial, bajo responsabilidad exclusiva de César Augusto Reyes Jaramillo.
                        </p>
                    </section>

                    <hr className="border-navy/10" />

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">8. Finalidades y Tratamientos Ulteriores</h2>
                        <p>
                            No utilizaremos tus datos para finalidades distintas a las declaradas en el punto 2. Cualquier uso futuro incompatible requerirá una nueva base legal habilitante o un nuevo consentimiento específico de tu parte.
                        </p>
                    </section>

                    <hr className="border-navy/10" />

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">9. Delegado de Protección de Datos (DPD)</h2>
                        <p>
                            Dado el volumen actual de operaciones y al no realizarse tratamiento masivo de categorías especiales de datos, no existe obligación legal de designar un DPD. Para cualquier consulta relacionada con privacidad, el punto de contacto directo es el Responsable en: negocios@cesarreyesjaramillo.com
                        </p>
                    </section>

                    <hr className="border-navy/10" />

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">10. Transferencia Internacional de Datos</h2>
                        <p>
                            Tus datos son almacenados en servidores propios alojados en infraestructura de Hostdom (Estados Unidos). Esta operación constituye una transferencia internacional de datos hacia una jurisdicción con niveles de protección técnica adecuados, gestionada bajo los acuerdos de servicio del proveedor de infraestructura. No compartimos tus datos con terceros para sus propios fines comerciales sin tu consentimiento explícito.
                        </p>
                    </section>

                    <hr className="border-navy/10" />

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">11. Consecuencias de la Negativa a Entregar Datos</h2>
                        <p>
                            La entrega de nombre y número de WhatsApp es obligatoria para la prestación del servicio. Si decides no proporcionarlos o solicitas su eliminación inmediata, ActivaQR no podrá generar tu VCard ni activar tu identidad digital.
                        </p>
                    </section>

                    <hr className="border-navy/10" />

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">12. Efecto de Suministrar Datos Erróneos</h2>
                        <p>
                            La entrega de información inexacta o desactualizada impedirá la correcta generación de tu VCard y el envío de notificaciones, afectando la calidad del servicio recibido. ActivaQR no asume responsabilidad por errores derivados de datos incorrectos proporcionados por el titular.
                        </p>
                    </section>

                    <hr className="border-navy/10" />

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">13. Revocatoria del Consentimiento</h2>
                        <p>
                            Puedes retirar tu autorización en cualquier momento, de forma gratuita y sin necesidad de justificación. El mecanismo técnico disponible es escribir la palabra &ldquo;BAJA&rdquo; en nuestro chat de WhatsApp. Nuestro sistema ejecutará un bloqueo técnico inmediato sobre tus datos en el sistema de comunicaciones. La revocatoria no tiene efectos retroactivos sobre tratamientos ya realizados con base en el consentimiento previo.
                        </p>
                    </section>

                    <hr className="border-navy/10" />

                    <section>
                        <h2 className="text-xl font-bold text-navy uppercase mb-3">14. Ejercicio de Derechos ARCO+PAL</h2>
                        <p className="mb-2">Como titular tienes derecho a solicitar:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre ti.</li>
                            <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos.</li>
                            <li><strong>Cancelación/Eliminación:</strong> Solicitar la supresión de tus datos.</li>
                            <li><strong>Oposición:</strong> Oponerte a determinados tratamientos.</li>
                            <li><strong>Portabilidad:</strong> Recibir tus datos en formato transferible.</li>
                            <li><strong>Anonimización:</strong> Solicitar que tus datos no sean identificables.</li>
                            <li><strong>Limitación:</strong> Restringir temporalmente el tratamiento.</li>
                        </ul>
                        <p className="mt-3">
                            Para ejercer cualquiera de estos derechos, escribe a: registro@activaqr.com
                        </p>
                        <p>
                            Atenderemos tu solicitud en un plazo máximo de 15 días hábiles (la suspensión de tratamiento se ejecuta en 3 días hábiles).
                        </p>
                    </section>

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
