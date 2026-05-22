'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, PenLine, Smartphone } from 'lucide-react';
import PayPhoneWidget from './PayPhoneWidget';

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
              Firmar y pagar →
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-navy/30">
          Al firmar, aceptas la firma electrónica y serás redirigido a PayPhone para realizar el pago seguro.
        </p>
      </div>
    </div>
  );
}

/**
 * Pantalla de éxito después de firmar el contrato — con PayPhone para pagar.
 */
export function FirmaExitosa({
  contratoId, producto, pagoData
}: {
  contratoId: string;
  producto?: { id: string; slug: string } | null;
  pagoData?: { monto: number; contratoId: string; cliente: { nombre: string; email: string; telefono: string } } | null;
}) {
  const [mostrarPago, setMostrarPago] = useState(false);
  const [payOption, setPayOption] = useState<'completo' | 'porcentaje' | 'valor' | 'abono'>('completo');
  const [payValue, setPayValue] = useState(50);
  const total = pagoData?.monto || 0;

  const montoAPagar = payOption === 'completo' ? total
    : payOption === 'porcentaje' ? total * payValue / 100
    : payValue; // valor fijo o abono

  if (!mostrarPago) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-navy/5 shadow-xl shadow-navy/5 max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-navy uppercase mb-3">✅ Contrato firmado</h2>
          <p className="text-navy/70 font-medium mb-6">
            Ahora puedes generar el pago para activar tu producto.
          </p>

          {/* Botón para pagar */}
          {pagoData && pagoData.monto > 0 && (
            <button
              type="button"
              onClick={() => setMostrarPago(true)}
              className="w-full bg-primary text-white font-black uppercase tracking-widest py-5 px-6 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 mb-3 text-lg"
            >
              💳 Generar pago
            </button>
          )}

          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="w-full border border-navy/20 text-navy font-bold uppercase tracking-widest py-4 px-6 rounded-xl hover:bg-navy/5 transition-all"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de pago con PayPhone
  if (!pagoData) return null;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white p-8 rounded-[2rem] border border-navy/5 shadow-xl shadow-navy/5">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-navy uppercase mb-1">Método de Pago</h2>
            <p className="text-sm text-navy/50">
              Total del servicio: <strong className="text-primary">${total.toFixed(2)} USD</strong>
            </p>
          </div>

          {/* Opciones de pago */}
          <div className="space-y-3 mb-6">
            <p className="text-xs font-bold text-navy uppercase tracking-wider">¿Cómo deseas pagar?</p>

            <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
              payOption === 'completo' ? 'border-primary bg-primary/5' : 'border-navy/10'
            }`}>
              <input type="radio" name="pay" checked={payOption === 'completo'} onChange={() => setPayOption('completo')} className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-bold text-navy">Pago completo</p>
                <p className="text-xs text-navy/60">${total.toFixed(2)} USD</p>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
              payOption === 'porcentaje' ? 'border-primary bg-primary/5' : 'border-navy/10'
            }`}>
              <input type="radio" name="pay" checked={payOption === 'porcentaje'} onChange={() => setPayOption('porcentaje')} className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold text-navy">Anticipo por %</p>
                {payOption === 'porcentaje' && (
                  <div className="flex items-center gap-2 mt-1">
                    <input type="range" min="10" max="100" value={payValue} onChange={e => setPayValue(parseInt(e.target.value))} className="flex-1 accent-primary" />
                    <span className="text-sm font-black text-primary min-w-[40px]">{payValue}%</span>
                  </div>
                )}
                <p className="text-xs text-navy/50 mt-1">${(total * payValue / 100).toFixed(2)} USD ahora</p>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
              payOption === 'valor' ? 'border-primary bg-primary/5' : 'border-navy/10'
            }`}>
              <input type="radio" name="pay" checked={payOption === 'valor'} onChange={() => setPayOption('valor')} className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold text-navy">Anticipo por valor fijo</p>
                {payOption === 'valor' && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-navy font-bold">$</span>
                    <input type="number" value={payValue} onChange={e => setPayValue(parseFloat(e.target.value) || 0)} min="0" max={total} className="w-full px-3 py-2 rounded-lg border border-navy/10 text-navy font-bold outline-none focus:border-primary" />
                  </div>
                )}
              </div>
            </label>

            <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
              payOption === 'abono' ? 'border-primary bg-primary/5' : 'border-navy/10'
            }`}>
              <input type="radio" name="pay" checked={payOption === 'abono'} onChange={() => { setPayOption('abono'); setPayValue(20); }} className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold text-navy">💰 Abono (efectivo / transferencia)</p>
                <p className="text-xs text-navy/60">El cliente paga en físico — no necesita PayPhone</p>
                {payOption === 'abono' && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-navy font-bold">$</span>
                    <input type="number" value={payValue} onChange={e => setPayValue(parseFloat(e.target.value) || 0)} min="0" className="w-full px-3 py-2 rounded-lg border border-navy/10 text-navy font-bold outline-none focus:border-primary" />
                  </div>
                )}
              </div>
            </label>

            {/* Resumen */}
            <div className="bg-navy/5 p-3 rounded-xl text-sm space-y-1">
              <div className="flex justify-between"><span className="text-navy/60">Total:</span><span className="font-bold">${total.toFixed(2)} USD</span></div>
              <div className="flex justify-between"><span className="text-navy/60">A pagar ahora:</span><span className="font-black text-primary">${montoAPagar.toFixed(2)} USD</span></div>
              {payOption !== 'completo' && payOption !== 'abono' && (
                <div className="flex justify-between"><span className="text-navy/60">Saldo restante:</span><span className="font-bold">${Math.max(0, total - montoAPagar).toFixed(2)} USD</span></div>
              )}
              {payOption === 'abono' && (
                <div className="flex justify-between"><span className="text-navy/60">Saldo por pagar:</span><span className="font-bold">${Math.max(0, total - montoAPagar).toFixed(2)} USD</span></div>
              )}
            </div>
          </div>

          {payOption === 'abono' ? (
            /* Abono en efectivo — sin PayPhone, crear producto ahora */
            <ConfirmarPagoAbono contratoId={pagoData.contratoId} montoAbono={montoAPagar} total={total} />
          ) : (
            /* Pago con PayPhone */
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#ff6f00]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-[#ff6f00]" size={32} />
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-navy mb-2">Pago Seguro con PayPhone</h3>
              <p className="text-sm text-navy/60 mb-4">Paga con cualquier tarjeta de crédito o débito de forma segura.</p>
              <p className="text-2xl font-black text-primary mb-6">${montoAPagar.toFixed(2)} USD</p>
            </div>
          )}

          {payOption !== 'abono' && (
            <PayPhoneWidget
              amount={montoAPagar}
              clientName={pagoData.cliente.nombre}
              clientEmail={pagoData.cliente.email}
              clientPhone={pagoData.cliente.telefono}
              contractId={pagoData.contratoId}
            />
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="text-sm text-navy/40 hover:text-navy transition-colors font-medium underline"
            >
              Pagar después — Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente para confirmar pago en efectivo/transferencia (abono).
 * Crea el producto llamando al endpoint confirmar-pago.
 */
function ConfirmarPagoAbono({ contratoId, montoAbono, total }: { contratoId: string; montoAbono: number; total: number }) {
  const [creando, setCreando] = useState(false);
  const [completado, setCompletado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [producto, setProducto] = useState<{ id: string; slug?: string; url?: string } | null>(null);

  useEffect(() => {
    if (creando || completado) return;
    setCreando(true);
    const crear = async () => {
      try {
        const res = await fetch(`/api/contratos/${contratoId}/confirmar-pago`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metodo: 'abono_efectivo', monto: montoAbono }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Error al crear producto');
        if (data.producto) setProducto(data.producto);
        setCompletado(true);
      } catch (err: any) {
        setError(err.message || 'Error al crear producto');
      } finally {
        setCreando(false);
      }
    };
    crear();
  }, [contratoId, creando, completado]);

  return (
    <div className="text-center">
      {creando && (
        <div className="py-8">
          <Loader2 size={32} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-navy/60">Creando producto...</p>
        </div>
      )}
      {completado && (
        <>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h3 className="text-xl font-black uppercase italic tracking-tighter text-navy mb-2">💰 Abono registrado</h3>
          <p className="text-sm text-navy/60 mb-2">El cliente abonó <strong className="text-primary text-lg">${montoAbono.toFixed(2)} USD</strong></p>
          <p className="text-xs text-navy/50 mb-6">Saldo pendiente: ${Math.max(0, total - montoAbono).toFixed(2)} USD</p>

          {producto && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-xs">
              <p className="font-bold text-green-800">✅ Producto creado</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="w-full bg-green-600 text-white font-black uppercase tracking-widest py-4 px-6 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
          >
            ✅ Finalizar
          </button>
        </>
      )}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
          <p className="font-bold mb-1">Error</p>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => { setCreando(false); setCompletado(false); setError(null); }}
            className="mt-3 text-red-700 underline font-medium"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
