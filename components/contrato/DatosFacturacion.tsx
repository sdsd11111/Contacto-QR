'use client';

import { FileText, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface DatosFacturacionProps {
  data: {
    facturacion_ruc: string;
    facturacion_razon_social: string;
    facturacion_direccion: string;
    facturacion_foto_url: string;
  };
  onChange: (field: string, value: any) => void;
}

export default function DatosFacturacion({ data, onChange }: DatosFacturacionProps) {
  const [subiendo, setSubiendo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mostrar preview inmediato local
    const localUrl = URL.createObjectURL(file);
    onChange('facturacion_foto_preview', localUrl);

    // Subir al servidor
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', `contrato-facturacion`);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        onChange('facturacion_foto_url', result.url);
      }
    } catch (err) {
      console.error('Error al subir foto de facturación:', err);
    }
    setSubiendo(false);
  };

  return (
    <details className="group bg-white rounded-[2rem] border border-navy/5 shadow-xl shadow-navy/5 overflow-hidden">
      <summary className="flex items-center justify-between p-6 md:p-8 cursor-pointer select-none hover:bg-navy/[0.02] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center">
            <FileText size={20} className="text-navy" />
          </div>
          <div>
            <h3 className="text-base font-black text-navy uppercase">Datos de facturación</h3>
            <p className="text-xs text-navy/50">Opcional — Para emitir factura con IVA</p>
          </div>
        </div>
        <span className="text-navy/30 text-2xl group-open:rotate-180 transition-transform">▾</span>
      </summary>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-navy mb-1 uppercase tracking-wider">RUC</label>
            <input
              type="text"
              value={data.facturacion_ruc}
              onChange={(e) => onChange('facturacion_ruc', e.target.value)}
              placeholder="13 dígitos"
              maxLength={13}
              className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-cream/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-navy"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy mb-1 uppercase tracking-wider">Razón Social</label>
            <input
              type="text"
              value={data.facturacion_razon_social}
              onChange={(e) => onChange('facturacion_razon_social', e.target.value)}
              placeholder="Nombre o razón social"
              className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-cream/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-navy"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-navy mb-1 uppercase tracking-wider">Dirección</label>
            <input
              type="text"
              value={data.facturacion_direccion}
              onChange={(e) => onChange('facturacion_direccion', e.target.value)}
              placeholder="Dirección fiscal"
              className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-cream/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-navy"
            />
          </div>
        </div>

        {/* Subir foto de comprobante */}
        <div>
          <label className="block text-xs font-bold text-navy mb-1 uppercase tracking-wider">Foto de comprobante (opcional)</label>
          <p className="text-[10px] text-navy/40 mb-2">A veces el RUC está en una foto, súbela aquí</p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={subiendo}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-navy/10 bg-cream/30 hover:bg-cream/50 transition-all text-sm font-medium text-navy/70"
            >
              <Upload size={16} />
              {subiendo ? 'Subiendo...' : 'Subir foto'}
            </button>
            {data.facturacion_foto_url && (
              <span className="text-xs text-green-600 font-medium">✓ Archivo subido</span>
            )}
          </div>
        </div>
      </div>
    </details>
  );
}
