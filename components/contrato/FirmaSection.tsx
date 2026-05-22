'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, PenLine } from 'lucide-react';

interface FirmaSectionProps {
  aceptaTerminos: boolean;
  aceptaPrivacidad: boolean;
  firmaNombre: string;
  onToggleTerminos: () => void;
  onTogglePrivacidad: () => void;
  onFirmaChange: (nombre: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}

export default function FirmaSection({
  aceptaTerminos, aceptaPrivacidad, firmaNombre,
  onToggleTerminos, onTogglePrivacidad, onFirmaChange,
  onSubmit, submitting, error
}: FirmaSectionProps) {
  const puedeEnviar = aceptaTerminos && aceptaPrivacidad && firmaNombre.trim().length >= 3 && !submitting;

  return (
    <div className="bg-white rounded-[2rem] border border-navy/5 shadow-xl shadow-navy/5 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-navy/5">
        <h2 className="text-xl font-black text-navy uppercase flex items-center gap-2">
          <PenLine size={22} className="text-primary" />
          Aceptación y firma
        </h2>
        <p className="text-sm text-navy/50 mt-1">
          Para finalizar, lee y acepta los términos, luego firma digitalmente
        </p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Checkbox Términos */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={onToggleTerminos}
              disabled={submitting}
              className="w-5 h-5 rounded border-navy/20 text-primary focus:ring-primary"
            />
          </div>
          <span className="text-sm text-navy/80 group-hover:text-navy transition-colors font-medium">
            <strong className="text-primary">*</strong> He leído y acepto los <strong>Términos y Condiciones</strong> del servicio descritos en la Sección B del contrato.
          </span>
        </label>

        {/* Checkbox Privacidad */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={aceptaPrivacidad}
              onChange={onTogglePrivacidad}
              disabled={submitting}
              className="w-5 h-5 rounded border-navy/20 text-primary focus:ring-primary"
            />
          </div>
          <span className="text-sm text-navy/80 group-hover:text-navy transition-colors font-medium">
            <strong className="text-primary">*</strong> He leído y acepto la <strong>Política de Privacidad</strong> y el tratamiento de mis datos personales descritos en la Sección C del contrato.
          </span>
        </label>

        {/* Firma digital */}
        <div className="pt-4 border-t border-navy/5">
          <label className="block text-sm font-bold text-navy mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <PenLine size={16} className="text-primary" />
            Firma digital * <span className="text-xs font-normal normal-case text-navy/50">(Escribe tu nombre completo)</span>
          </label>
          <input
            type="text"
            value={firmaNombre}
            onChange={(e) => onFirmaChange(e.target.value)}
            placeholder="Ej: Juan Carlos Pérez Mendoza"
            disabled={submitting}
            maxLength={200}
            className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-cream/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-navy text-lg font-semibold"
          />
          {firmaNombre.trim().length > 0 && firmaNombre.trim().length < 3 && (
            <p className="text-xs text-amber-600 mt-1">Escribe tu nombre completo (mín. 3 caracteres)</p>
          )}
          <p className="text-[10px] text-navy/40 mt-1.5">
            Al escribir tu nombre, confirmas que eres la persona que acepta este contrato. 
            Quedará registrado junto con la fecha, hora y datos del dispositivo.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Botón enviar */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!puedeEnviar}
          className="w-full bg-primary text-white font-black uppercase tracking-widest py-5 px-6 rounded-xl hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-4 shadow-lg shadow-primary/20 flex items-center justify-center gap-3 text-lg"
        >
          {submitting ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              Firmando contrato...
            </>
          ) : (
            <>
              <CheckCircle size={22} />
              Firmar y enviar contrato
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-navy/30">
          Al enviar, aceptas que este documento constituye una firma electrónica válida según la legislación ecuatoriana.
          Recibirás una copia de confirmación.
        </p>
      </div>
    </div>
  );
}

/**
 * Pantalla de éxito después de firmar el contrato.
 */
export function FirmaExitosa({ contratoId, producto }: { contratoId: string; producto?: { id: string; slug: string } | null }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-navy/5 shadow-xl shadow-navy/5 max-w-lg w-full text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-navy uppercase mb-3">¡Listo! 🎉</h2>
        <p className="text-navy/70 font-medium mb-2">
          Contrato firmado exitosamente.
        </p>
        <p className="text-sm text-navy/50 mb-6">
          El asesor te contactará pronto. También te avisaremos por WhatsApp.
        </p>

        {/* Producto creado */}
        {producto && (
          <div className="bg-navy/5 p-4 rounded-xl mb-4 text-left">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle size={16} />
              <span className="text-xs font-bold uppercase">Producto creado en ActivaQR</span>
            </div>
            <p className="text-[10px] text-navy/50 font-mono break-all">ID: {producto.id}</p>
          </div>
        )}

        <div className="bg-navy/5 p-4 rounded-xl mb-6">
          <p className="text-xs text-navy/50 uppercase tracking-wider font-bold mb-1">ID del contrato</p>
          <p className="text-sm font-mono text-navy font-bold break-all">{contratoId}</p>
        </div>

        <button
          type="button"
          onClick={() => window.location.href = '/'}
          className="w-full bg-primary text-white font-black uppercase tracking-widest py-4 px-6 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
