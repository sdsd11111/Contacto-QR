'use client';

import { useState, useEffect } from 'react';
import { FileText, ShieldCheck, Scale } from 'lucide-react';
import { ContratoData } from './DatosForm';
import { SERVICIOS_LIST } from '@/lib/contrato-utils';

interface ContratoDinamicoProps {
  data: ContratoData;
  contratoId: string;
  expandedSection: string | null;
  onToggleSection: (section: string) => void;
  aceptaTerminos: boolean;
  aceptaPrivacidad: boolean;
  onToggleTerminos: () => void;
  onTogglePrivacidad: () => void;
}

const PRIVACIDAD_TEXTO = `
1. Identidad del Responsable del Tratamiento
César Augusto Reyes Jaramillo, con domicilio legal en las calles Juan José Peña 1181 y Mercadillo, Loja - Ecuador, teléfono +593963410409 y correo electrónico negocios@cesarreyesjaramillo.com, es el Responsable del tratamiento de tus datos personales bajo la plataforma ActivaQR.

2. Finalidades del Tratamiento
Tus datos personales son tratados exclusivamente para:
- Gestión de Identidad Digital: Creación, personalización y entrega de tu VCard digital; registro en la agenda de contactos comercial del cliente que te compartió el código QR.
- Notificaciones de Valor: Envío de cotizaciones, actualizaciones sobre herramientas tecnológicas y casos de éxito comerciales vía WhatsApp y correo electrónico.

3. Base Legal del Tratamiento
El tratamiento de tus datos se fundamenta en tu consentimiento libre, específico, informado e inequívoco, otorgado al completar el formulario de activación (Art. 7.1 de la LOPDP). Para clientes con relación contractual activa, aplica adicionalmente la base de ejecución de medidas precontractuales o contractuales (Art. 7.5 LOPDP).

4. Tipos de Tratamiento Realizados
Sobre tus datos realizamos las siguientes operaciones: recolección, registro, almacenamiento, estructuración, consulta, comunicación y transferencia internacional hacia la infraestructura de alojamiento declarada.

5. Tiempo de Conservación
Conservaremos tu información mientras dure la relación comercial o hasta que solicites su eliminación. Realizamos revisiones periódicas cada 2 años para verificar la pertinencia de los datos almacenados. Una vez concluida la relación y vencido el plazo de revisión, los datos serán eliminados de forma definitiva.

6. Origen de los Datos
Los datos son obtenidos directamente del titular a través del escaneo del código QR y la interacción con el formulario de activación del sistema ActivaQR.

7. Existencia de Base de Datos
Tus datos forman parte de la base de datos denominada "Contactos ActivaQR", de uso comercial, bajo responsabilidad exclusiva de César Augusto Reyes Jaramillo.

8. Finalidades y Tratamientos Ulteriores
No utilizaremos tus datos para finalidades distintas a las declaradas en el punto 2. Cualquier uso futuro incompatible requerirá una nueva base legal habilitante o un nuevo consentimiento específico de tu parte.

9. Delegado de Protección de Datos (DPD)
Dado el volumen actual de operaciones y al no realizarse tratamiento masivo de categorías especiales de datos, no existe obligación legal de designar un DPD. Para cualquier consulta relacionada con privacidad, el punto de contacto directo es el Responsable en: negocios@cesarreyesjaramillo.com

10. Transferencia Internacional de Datos
Tus datos son almacenados en servidores propios alojados en infraestructura de Hostdom (Estados Unidos). Esta operación constituye una transferencia internacional de datos hacia una jurisdicción con niveles de protección técnica adecuados, gestionada bajo los acuerdos de servicio del proveedor de infraestructura. No compartimos tus datos con terceros para sus propios fines comerciales sin tu consentimiento explícito.

11. Consecuencias de la Negativa a Entregar Datos
La entrega de nombre y número de WhatsApp es obligatoria para la prestación del servicio. Si decides no proporcionarlos o solicitas su eliminación inmediata, ActivaQR no podrá generar tu VCard ni activar tu identidad digital.

12. Efecto de Suministrar Datos Erróneos
La entrega de información inexacta o desactualizada impedirá la correcta generación de tu VCard y el envío de notificaciones, afectando la calidad del servicio recibido. ActivaQR no asume responsabilidad por errores derivados de datos incorrectos proporcionados por el titular.

13. Revocatoria del Consentimiento
Puedes retirar tu autorización en cualquier momento, de forma gratuita y sin necesidad de justificación. El mecanismo técnico disponible es escribir la palabra "BAJA" en nuestro chat de WhatsApp. Nuestro sistema ejecutará un bloqueo técnico inmediato sobre tus datos en el sistema de comunicaciones. La revocatoria no tiene efectos retroactivos sobre tratamientos ya realizados con base en el consentimiento previo.

14. Ejercicio de Derechos ARCO+PAL
Como titular tienes derecho a solicitar:
- Acceso: Conocer qué datos tenemos sobre ti.
- Rectificación: Corregir datos inexactos o incompletos.
- Cancelación/Eliminación: Solicitar la supresión de tus datos.
- Oposición: Oponerte a determinados tratamientos.
- Portabilidad: Recibir tus datos en formato transferible.
- Anonimización: Solicitar que tus datos no sean identificables.
- Limitación: Restringir temporalmente el tratamiento.
Para ejercer cualquiera de estos derechos, escribe a: registro@activaqr.com
Atenderemos tu solicitud en un plazo máximo de 15 días hábiles (la suspensión de tratamiento se ejecuta en 3 días hábiles).
`.trim();

export default function ContratoDinamico({
  data, contratoId, expandedSection, onToggleSection,
  aceptaTerminos, aceptaPrivacidad, onToggleTerminos, onTogglePrivacidad,
}: ContratoDinamicoProps) {
  const serviciosTexto = (data.servicios_seleccionados || []).map(id => {
    const s = SERVICIOS_LIST.find(sv => sv.id === id);
    return s ? `${s.icono} ${s.nombre}` : id;
  }).join(', ');

  const fechaActual = new Date().toLocaleDateString('es-EC', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="bg-white rounded-[2rem] border border-navy/5 shadow-xl shadow-navy/5 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-navy/5">
        <h2 className="text-xl font-black text-navy uppercase flex items-center gap-2">
          <FileText size={22} className="text-primary" />
          Contrato de servicios
        </h2>
        <p className="text-sm text-navy/50 mt-1">
          El contrato se genera automáticamente con tus datos — <strong>no necesita clic en "generar"</strong>
        </p>
      </div>

      {/* Sección A — Resumen */}
      <AccordionSection
        id="resumen"
        icon="📋"
        title="Sección A — Resumen del servicio contratado"
        isOpen={expandedSection === 'resumen'}
        onToggle={() => onToggleSection('resumen')}
      >
        <div className="space-y-2 text-sm text-navy/80">
          <Fila texto="Cliente" valor={data.cliente_nombre || '—'} />
          {data.cliente_negocio && <Fila texto="Negocio" valor={data.cliente_negocio} />}
          {data.cliente_cedula_ruc && <Fila texto="Cédula/RUC" valor={data.cliente_cedula_ruc} />}
          <Fila texto="Teléfono" valor={data.cliente_telefono || '—'} />
          <Fila texto="Email" valor={data.cliente_email || '—'} />
          {data.cliente_red_social && <Fila texto="Red social" valor={data.cliente_red_social} />}
          {data.cliente_categorias && <Fila texto="Categorías" valor={data.cliente_categorias} />}
          <div className="border-t border-navy/5 pt-3 mt-3" />
          <div className="font-medium">Servicios contratados:</div>
          <div className="space-y-1 pl-2">
            {(data.servicios_seleccionados || []).map(id => {
              const s = SERVICIOS_LIST.find(sv => sv.id === id);
              return s ? (
                <div key={id} className="flex justify-between text-sm">
                  <span>{s.icono} {s.nombre}</span>
                  <span className="font-bold text-primary">${s.precio} USD</span>
                </div>
              ) : null;
            })}
          </div>
          <div className="border-t border-navy/5 pt-2 mt-2" />
          <Fila texto="Monto total" valor={`$${(data.monto_total || 0).toFixed(2)} USD`} />
          <Fila texto="Anticipo" valor={`$${(data.monto_anticipo || 0).toFixed(2)} USD`} />
          <Fila texto="Fecha de contratación" valor={fechaActual} />
        </div>
      </AccordionSection>

      {/* Sección B — Contrato */}
      <AccordionSection
        id="terminos"
        icon={<Scale size={18} />}
        title="Sección B — Contrato de Producto"
        isOpen={expandedSection === 'terminos'}
        onToggle={() => onToggleSection('terminos')}
      >
        <div className="text-sm text-navy/80 leading-relaxed space-y-3 whitespace-pre-line font-medium">
          <p><strong>1. PARTES</strong></p>
          <p>
            Comparece: <strong>{data.cliente_nombre || '[NOMBRE DEL CLIENTE]'}</strong>, en adelante "EL CONTRATANTE"; 
            y <strong>César Augusto Reyes Jaramillo</strong>, con C.I. 1103421531001, representante de ActivaQR, 
            en adelante "EL PROVEEDOR".
          </p>

          <p><strong>2. OBJETO DEL CONTRATO</strong></p>
          <p>
            EL CONTRATANTE contrata los servicios digitales de ActivaQR: <strong>{serviciosTexto}</strong>. 
            EL PROVEEDOR se compromete a mantenerlos activos, funcionales y accesibles durante la vigencia del contrato.
          </p>

          <p><strong>3. PLAZO</strong></p>
          <p>
            El presente contrato tiene una vigencia de <strong>UN AÑO</strong> contado desde la fecha de suscripción. 
            EL PROVEEDOR asume el mantenimiento del hosting, dominio y servicio durante todo el período.
          </p>

          <p><strong>4. VALOR Y FORMA DE PAGO</strong></p>
          <p>
            Valor total: <strong>${(data.monto_total || 0).toFixed(2)} USD</strong>. 
            Anticipo: <strong>${(data.monto_anticipo || 0).toFixed(2)} USD</strong>. 
            Saldo restante según acuerdo entre las partes.
          </p>

          <p><strong>5. CLAVE DE EDICIÓN (AUTOGESTIÓN)</strong></p>
          <p>
            EL PROVEEDOR entregará a EL CONTRATANTE una clave de edición para que pueda modificar sus propios datos, 
            contenidos, precios, fotos y promociones de forma autónoma, sin depender del PROVEEDOR. 
            Esto incluye cambios de texto, actualización de fotografías, precios y cualquier contenido 
            que no requiera intervención técnica.
          </p>

          <p><strong>6. CONFIDENCIALIDAD</strong></p>
          <p>
            EL PROVEEDOR se compromete a mantener la confidencialidad de toda la información compartida 
            por EL CONTRATANTE, no divulgándola a terceros sin autorización expresa.
          </p>

          <p><strong>7. ACEPTACIÓN</strong></p>
          <p>
            Las partes declaran haber leído y comprendido los términos del presente contrato, aceptándolos 
            libre y voluntariamente. Firmado en Loja, {fechaActual}.
          </p>
        </div>
        {/* Checkbox dentro de Sección B */}
        <div className="px-6 md:px-8 pb-6 pt-2 border-t border-navy/5">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={onToggleTerminos}
              className="w-5 h-5 rounded border-navy/20 text-primary focus:ring-primary mt-0.5"
            />
            <span className="text-sm text-navy/80 group-hover:text-navy transition-colors font-medium">
              <strong className="text-primary">*</strong> He leído y <strong>acepto el Contrato de Producto</strong> descrito en esta sección
            </span>
          </label>
        </div>
      </AccordionSection>

      {/* Sección C — Privacidad */}
      <AccordionSection
        id="privacidad"
        icon={<ShieldCheck size={18} />}
        title="Sección C — Política de privacidad"
        isOpen={expandedSection === 'privacidad'}
        onToggle={() => onToggleSection('privacidad')}
      >
        <div className="text-xs text-navy/70 leading-relaxed space-y-2 whitespace-pre-line font-medium">
          {PRIVACIDAD_TEXTO.split('\n').map((line, i) => {
            if (!line.trim()) return null;
            if (line.match(/^\d\./)) {
              return <p key={i} className="text-[11px] font-bold text-navy">{line}</p>;
            }
            if (line.startsWith('-')) {
              return <li key={i} className="ml-4 list-disc text-[11px]">{line.substring(2)}</li>;
            }
            return <p key={i} className="text-[11px]">{line}</p>;
          })}
        </div>
        {/* Checkbox dentro de Sección C */}
        <div className="px-6 md:px-8 pb-6 pt-2 border-t border-navy/5">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={aceptaPrivacidad}
              onChange={onTogglePrivacidad}
              className="w-5 h-5 rounded border-navy/20 text-primary focus:ring-primary mt-0.5"
            />
            <span className="text-sm text-navy/80 group-hover:text-navy transition-colors font-medium">
              <strong className="text-primary">*</strong> He leído y <strong>acepto la Política de Privacidad</strong> y el tratamiento de mis datos personales
            </span>
          </label>
        </div>
      </AccordionSection>

    </div>
  );
}

/* Subcomponentes */
function AccordionSection({ id, icon, title, children, isOpen, onToggle }: {
  id: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-navy/5 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-navy/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-primary shrink-0">{icon}</span>
          <span className="text-sm font-black text-navy uppercase">{title}</span>
        </div>
        <span className={`text-navy/30 text-xl transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 md:px-8 pb-6 md:pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}

function Fila({ texto, valor }: { texto: string; valor: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-navy/50 font-semibold min-w-[120px] text-xs uppercase tracking-wider">{texto}</span>
      <span className="text-navy font-medium text-right break-words max-w-[60%]">{valor}</span>
    </div>
  );
}
