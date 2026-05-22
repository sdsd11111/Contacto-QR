'use client';

import { useState, useEffect } from 'react';
import { FileText, ShieldCheck, Scale, CreditCard, Smartphone, ExternalLink } from 'lucide-react';
import { ContratoData } from './DatosForm';
import { SERVICIOS_LIST } from '@/lib/contrato-utils';
import PayPhoneWidget from './PayPhoneWidget';

interface ContratoDinamicoProps {
  data: ContratoData;
  contratoId: string;
  expandedSection: string | null;
  onToggleSection: (section: string) => void;
  aceptaTerminos: boolean;
  aceptaPrivacidad: boolean;
  onToggleTerminos: () => void;
  onTogglePrivacidad: () => void;
  // Payment
  paymentOption: 'completo' | 'anticipo_porcentaje' | 'anticipo_valor';
  paymentValue: number;
  onPaymentOptionChange: (opt: 'completo' | 'anticipo_porcentaje' | 'anticipo_valor') => void;
  onPaymentValueChange: (val: number) => void;
}

const PRIVACIDAD_TEXTO = `
1. IDENTIDAD DEL RESPONSABLE
ActivaQR, operada por el Grupo Empresarial Reyes, es el Responsable del tratamiento de tus datos personales.

2. FINALIDADES DEL TRATAMIENTO
Tus datos (nombre, teléfono y correo) serán tratados para:
- Gestión de Identidad Digital
- Notificaciones de Valor: envío de cotizaciones, actualizaciones y casos de éxito vía WhatsApp y email.
- Ejecución del servicio contratado según los términos del presente contrato.

3. BASE LEGAL
Este tratamiento se basa en tu consentimiento libre e inequívoco.

4. TIEMPO DE CONSERVACIÓN
Conservaremos tu información mientras dure la relación comercial o hasta que solicites su eliminación.

5. TUS DERECHOS (ARCO+PAL)
Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación/Eliminación, Oposición, Portabilidad, Anonimización y Limitación.

6. REVOCATORIA
Puedes retirar tu consentimiento en cualquier momento escribiendo "BAJA" en nuestro chat de WhatsApp.
`.trim();

export default function ContratoDinamico({
  data, contratoId, expandedSection, onToggleSection,
  aceptaTerminos, aceptaPrivacidad, onToggleTerminos, onTogglePrivacidad,
  paymentOption, paymentValue, onPaymentOptionChange, onPaymentValueChange
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

      {/* Sección B — Términos */}
      <AccordionSection
        id="terminos"
        icon={<Scale size={18} />}
        title="Sección B — Términos y condiciones"
        isOpen={expandedSection === 'terminos'}
        onToggle={() => onToggleSection('terminos')}
      >
        <div className="text-sm text-navy/80 leading-relaxed space-y-3 whitespace-pre-line font-medium">
          <p><strong>1. PARTES</strong></p>
          <p>
            Comparece: <strong>{data.cliente_nombre || '[NOMBRE DEL CLIENTE]'}</strong>, en adelante "EL CLIENTE"; 
            y ActivaQR, operado por Grupo Empresarial Reyes, en adelante "EL PROVEEDOR".
          </p>

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
              <strong className="text-primary">*</strong> He leído y <strong>acepto los Términos y Condiciones</strong> descritos en esta sección
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
        <div className="text-sm text-navy/80 leading-relaxed space-y-3 whitespace-pre-line font-medium">
          {PRIVACIDAD_TEXTO.split('\n').map((line, i) => {
            if (!line.trim()) return null;
            if (line.match(/^\d\./)) {
              return <p key={i}><strong>{line}</strong></p>;
            }
            if (line.startsWith('-')) {
              return <li key={i} className="ml-4 list-disc">{line.substring(2)}</li>;
            }
            return <p key={i}>{line}</p>;
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

      {/* Sección D — Método de pago */}
      <AccordionSection
        id="pago"
        icon={<CreditCard size={18} />}
        title="Sección D — Método de pago"
        isOpen={expandedSection === 'pago'}
        onToggle={() => onToggleSection('pago')}
      >
        <div className="space-y-5">
          <div className="bg-navy text-white p-5 rounded-xl text-center">
            <p className="text-xs uppercase tracking-wider opacity-70 font-bold">Total del servicio</p>
            <p className="text-3xl font-black mt-1">${(data.monto_total || 0).toFixed(2)} USD</p>
            {(data.monto_anticipo || 0) > 0 && (
              <p className="text-sm opacity-70 mt-1">Anticipo sugerido: ${(data.monto_anticipo || 0).toFixed(2)} USD</p>
            )}
          </div>

          {/* Opciones de pago */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-navy uppercase tracking-wider">Selecciona cómo deseas pagar:</p>

            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              paymentOption === 'completo' ? 'border-primary bg-primary/5' : 'border-navy/10 bg-cream/30'
            }`}>
              <input type="radio" name="payment" value="completo" checked={paymentOption === 'completo'} onChange={() => onPaymentOptionChange('completo')} className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-bold text-navy">Pago completo</p>
                <p className="text-xs text-navy/60">Cancela el total ahora: <strong className="text-primary">${(data.monto_total || 0).toFixed(2)} USD</strong></p>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              paymentOption === 'anticipo_porcentaje' ? 'border-primary bg-primary/5' : 'border-navy/10 bg-cream/30'
            }`}>
              <input type="radio" name="payment" value="anticipo_porcentaje" checked={paymentOption === 'anticipo_porcentaje'} onChange={() => onPaymentOptionChange('anticipo_porcentaje')} className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold text-navy">Anticipo por porcentaje</p>
                <p className="text-xs text-navy/60 mb-2">Elige el % del total que pagarás ahora</p>
                {paymentOption === 'anticipo_porcentaje' && (
                  <div className="flex items-center gap-3">
                    <input type="range" min="10" max="100" value={paymentValue} onChange={(e) => onPaymentValueChange(parseInt(e.target.value))} className="flex-1 accent-primary" />
                    <span className="text-sm font-black text-primary min-w-[60px] text-right">{paymentValue}%</span>
                  </div>
                )}
                <p className="text-xs text-navy/50 mt-1">A pagar ahora: <strong className="text-primary">${((data.monto_total || 0) * (paymentOption === 'anticipo_porcentaje' ? paymentValue : 50) / 100).toFixed(2)} USD</strong></p>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              paymentOption === 'anticipo_valor' ? 'border-primary bg-primary/5' : 'border-navy/10 bg-cream/30'
            }`}>
              <input type="radio" name="payment" value="anticipo_valor" checked={paymentOption === 'anticipo_valor'} onChange={() => onPaymentOptionChange('anticipo_valor')} className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold text-navy">Anticipo por valor fijo</p>
                <p className="text-xs text-navy/60 mb-2">Ingresa el monto exacto que pagarás ahora</p>
                {paymentOption === 'anticipo_valor' && (
                  <div className="flex items-center gap-2">
                    <span className="text-navy font-bold">$</span>
                    <input type="number" value={paymentValue} onChange={(e) => onPaymentValueChange(parseFloat(e.target.value) || 0)} min="0" max={data.monto_total || 0} className="w-full px-3 py-2 rounded-lg border border-navy/10 text-navy font-bold text-lg outline-none focus:border-primary" />
                    <span className="text-xs text-navy/50">USD</span>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Calcular monto a pagar */}
          <div className="bg-navy/5 p-4 rounded-xl">
            <div className="flex justify-between text-sm">
              <span className="text-navy/60">Total del servicio:</span>
              <span className="font-bold">${(data.monto_total || 0).toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-navy/60">A pagar ahora:</span>
              <span className="font-black text-primary text-lg">
                ${(() => {
                  if (paymentOption === 'completo') return (data.monto_total || 0).toFixed(2);
                  if (paymentOption === 'anticipo_porcentaje') return ((data.monto_total || 0) * paymentValue / 100).toFixed(2);
                  return paymentValue.toFixed(2);
                })()} USD
              </span>
            </div>
            {paymentOption !== 'completo' && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-navy/60">Saldo restante:</span>
                <span className="font-bold">${(() => {
                  const pagado = paymentOption === 'anticipo_porcentaje' 
                    ? (data.monto_total || 0) * paymentValue / 100 
                    : paymentValue;
                  return Math.max(0, (data.monto_total || 0) - pagado).toFixed(2);
                })()} USD</span>
              </div>
            )}
          </div>

          {/* Widget PayPhone */}
          <div className="pt-4 border-t border-navy/5">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-[#ff6f00]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Smartphone className="text-[#ff6f00]" size={24} />
              </div>
              <h3 className="text-base font-black uppercase italic tracking-tighter text-navy mb-1">Pago Seguro con PayPhone</h3>
              <p className="text-xs text-navy/50 mb-1">Paga con cualquier tarjeta de crédito o débito</p>
              <p className="text-lg font-black text-primary tracking-tighter">
                ${(() => {
                  if (paymentOption === 'completo') return (data.monto_total || 0).toFixed(2);
                  if (paymentOption === 'anticipo_porcentaje') return ((data.monto_total || 0) * paymentValue / 100).toFixed(2);
                  return paymentValue.toFixed(2);
                })()} USD
              </p>
            </div>

            <PayPhoneWidget
              amount={(() => {
                if (paymentOption === 'completo') return (data.monto_total || 0);
                if (paymentOption === 'anticipo_porcentaje') return (data.monto_total || 0) * paymentValue / 100;
                return paymentValue;
              })()}
              clientName={data.cliente_nombre}
              clientEmail={data.cliente_email}
              clientPhone={data.cliente_telefono}
              contractId={contratoId}
            />

            <p className="text-[9px] text-navy/30 mt-4 text-center uppercase tracking-widest font-black">
              Transacción procesada por PayPhone
            </p>
          </div>
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
