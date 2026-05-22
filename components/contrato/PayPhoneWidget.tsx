'use client';

import { useEffect, useState, useRef } from 'react';
import { Smartphone, ExternalLink, Loader2 } from 'lucide-react';

interface PayPhoneWidgetProps {
  amount: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  contractId: string;
}

export default function PayPhoneWidget({
  amount,
  clientName,
  clientEmail,
  clientPhone,
  contractId,
}: PayPhoneWidgetProps) {
  const [widgetReady, setWidgetReady] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);
  const initializedRef = useRef(false);

  // Cargar script de PayPhone (Box v1.1 - CDN oficial) — UNA SOLA VEZ
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Si ya está cargado globalmente, listo
    if ((window as any).PPaymentButtonBox) {
      setWidgetReady(true);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    const waitForPBox = (onReady: () => void, onFail: () => void) => {
      const interval = setInterval(() => {
        if ((window as any).PPaymentButtonBox) {
          clearInterval(interval);
          onReady();
        }
      }, 300);
      intervals.push(interval);
      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (!(window as any).PPaymentButtonBox) onFail();
      }, 10000);
      timers.push(timeout);
    };

    // Verificar si el script ya está en el DOM (hot reload)
    const existingScript = document.querySelector('script[src*="payphone-payment-box"]');
    if (existingScript) {
      waitForPBox(
        () => setWidgetReady(true),
        () => setScriptFailed(true)
      );
      return () => { timers.forEach(t => clearTimeout(t)); intervals.forEach(i => clearInterval(i)); };
    }

    // Agregar CSS (solo si no existe)
    if (!document.querySelector('link[href*="payphone-payment-box.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css';
      document.head.appendChild(link);
    }

    // Crear script (type=module como en /registro)
    const script = document.createElement('script');
    script.src = 'https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js';
    script.type = 'module';
    script.onload = () => {
      waitForPBox(
        () => setWidgetReady(true),
        () => setScriptFailed(true)
      );
    };
    script.onerror = () => { setScriptFailed(true); };
    document.body.appendChild(script);

    return () => {
      timers.forEach(t => clearTimeout(t));
      intervals.forEach(i => clearInterval(i));
    };
  }, []);

  // Cuando el widget está listo, inicializar PBox en el container
  useEffect(() => {
    if (!widgetReady || amount <= 0) return;

    const PBox = (window as any).PPaymentButtonBox;
    if (!PBox) return;

    const timer = setTimeout(() => {
      const container = document.getElementById('pp-button-container');
      if (!container) return;

      container.innerHTML = '';
      const amountInCents = Math.round(amount * 100);
      const transactionId = `contrato_${contractId}_${Date.now()}`;

      // Guardar backup para que /registro sepa qué email verificar
      try {
        localStorage.setItem('payphone_form_backup', JSON.stringify({
          email: clientEmail,
          name: clientName,
          whatsapp: clientPhone,
          plan: 'contrato',
          fromContrato: true,
          contratoId: contractId,
        }));
      } catch (e) {}

      try {
        const ppb = new PBox({
          token: process.env.NEXT_PUBLIC_PAYPHONE_TOKEN,
          amount: amountInCents,
          amountWithoutTax: amountInCents,
          currency: 'USD',
          clientTransactionId: transactionId,
          storeId: process.env.NEXT_PUBLIC_PAYPHONE_STORE_ID,
          reference: `Contrato ActivaQR - ${clientName || 'Cliente'}`,
          lang: 'es',
          responseUrl: `${window.location.origin}/registro`,
          cancellationUrl: `${window.location.origin}/registro`,
          onComplete: () => {
            // Redirigir manualmente al contrato con éxito
            window.location.href = `${window.location.origin}/contrato/${contractId}?pago=exitoso`;
          },
          onCancel: () => {
            console.log('[PayPhone] Pago cancelado');
          },
        });
        ppb.render('pp-button-container');
        setScriptFailed(false);
      } catch (err) {
        console.error('[PayPhone] Error PBox:', err);
        setScriptFailed(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [widgetReady, amount, clientName, contractId]);

  // Estado: cargando widget
  if (!widgetReady && !scriptFailed) {
    return (
      <div className="text-center p-8 bg-navy/[0.02] rounded-xl border border-navy/5">
        <Loader2 size={24} className="animate-spin text-primary mx-auto mb-3" />
        <p className="text-sm text-navy/60 font-medium">Cargando módulo de pago seguro...</p>
      </div>
    );
  }

  // Estado: widget cargado → mostrar PBox
  if (widgetReady && !scriptFailed) {
    return (
      <div>
        <div id="pp-button-container" className="min-h-[300px]" />
        <p className="text-[9px] text-navy/30 mt-4 text-center uppercase tracking-widest font-black">
          Transacción procesada por PayPhone
        </p>
      </div>
    );
  }

  // Estado: fallback (script no disponible o error)
  return (
    <div className="text-center p-6 bg-navy/[0.02] rounded-xl border border-navy/5">
      <div className="w-14 h-14 bg-[#ff6f00]/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Smartphone className="text-[#ff6f00]" size={28} />
      </div>
      <h3 className="text-lg font-black uppercase italic tracking-tighter text-navy mb-1">Pago Seguro con PayPhone</h3>
      <p className="text-sm text-navy/50 mb-4">Paga con cualquier tarjeta de crédito o débito</p>
      <p className="text-2xl font-black text-primary mb-6">${amount.toFixed(2)} USD</p>

      <button
        type="button"
        onClick={() => {
          const tid = `contrato_${contractId}_${Date.now()}`;
          const payUrl = `https://pay.payphonetodoesposible.com/api/button/V2?token=${process.env.NEXT_PUBLIC_PAYPHONE_TOKEN}&storeId=${process.env.NEXT_PUBLIC_PAYPHONE_STORE_ID}&amount=${Math.round(amount * 100)}&clientTransactionId=${tid}&currency=USD&reference=Contrato%20ActivaQR%20-%20${encodeURIComponent(clientName || '')}&responseUrl=${encodeURIComponent(window.location.origin + '/registro')}`;
          window.open(payUrl, '_blank', 'width=600,height=800');
        }}
        className="w-full bg-[#ff6f00] text-white font-black py-4 rounded-2xl uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#ff6f00]/20"
      >
        <ExternalLink size={20} />
        Pagar ${amount.toFixed(2)} con PayPhone
      </button>

      <p className="text-xs text-navy/40 mt-4 font-medium">
        💡 Se abrirá una ventana segura de PayPhone
      </p>
    </div>
  );
}
