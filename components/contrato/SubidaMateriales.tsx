'use client';

import { useRef, useState } from 'react';
import { Upload, Image, FileText, X, Check, Loader2 } from 'lucide-react';

interface SubidaMaterialesProps {
  data: {
    logo_url: string;
    fotos_url: string[];
    archivos_extra_url: string[];
  };
  onChange: (field: string, value: any) => void;
}

export default function SubidaMateriales({ data, onChange }: SubidaMaterialesProps) {
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const fotosInputRef = useRef<HTMLInputElement>(null);
  const archivosInputRef = useRef<HTMLInputElement>(null);

  const subirArchivo = async (file: File, tipo: string) => {
    setSubiendo(tipo);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', `contrato-materiales`);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        return result.url;
      }
    } catch (err) {
      console.error(`Error al subir ${tipo}:`, err);
    }
    return null;
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('El logo debe ser menor a 5MB');
      return;
    }

    const url = await subirArchivo(file, 'logo');
    if (url) onChange('logo_url', url);
    setSubiendo(null);
  };

  const handleFotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentFotos = data.fotos_url || [];
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`El archivo ${file.name} supera los 10MB`);
        continue;
      }
      const url = await subirArchivo(file, 'foto');
      if (url) currentFotos.push(url);
    }
    
    onChange('fotos_url', [...currentFotos]);
    setSubiendo(null);
  };

  const handleArchivosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentArchivos = data.archivos_extra_url || [];
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`El archivo ${file.name} supera los 10MB`);
        continue;
      }
      const url = await subirArchivo(file, 'archivo');
      if (url) currentArchivos.push(url);
    }
    
    onChange('archivos_extra_url', [...currentArchivos]);
    setSubiendo(null);
  };

  const removeFoto = (index: number) => {
    const newFotos = [...(data.fotos_url || [])];
    newFotos.splice(index, 1);
    onChange('fotos_url', newFotos);
  };

  return (
    <details className="group bg-white rounded-[2rem] border border-navy/5 shadow-xl shadow-navy/5 overflow-hidden">
      <summary className="flex items-center justify-between p-6 md:p-8 cursor-pointer select-none hover:bg-navy/[0.02] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center">
            <Upload size={20} className="text-navy" />
          </div>
          <div>
            <h3 className="text-base font-black text-navy uppercase">Entrega de materiales</h3>
            <p className="text-xs text-navy/50">Sube tu logo, fotos o archivos para tu ActivaQR</p>
          </div>
        </div>
        <span className="text-navy/30 text-2xl group-open:rotate-180 transition-transform">▾</span>
      </summary>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-6">
        {/* Logo */}
        <div>
          <label className="block text-xs font-bold text-navy mb-1 uppercase tracking-wider flex items-center gap-1.5">
            <Image size={14} className="text-primary" />
            Logo de tu negocio (PNG, JPG, SVG — máx. 5MB)
          </label>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleLogoChange}
            className="hidden"
          />
          {data.logo_url ? (
            <div className="flex items-center gap-3 mt-2 p-3 bg-green-50 rounded-xl border border-green-200">
              <Check size={18} className="text-green-600 shrink-0" />
              <span className="text-sm text-green-700 font-medium">Logo subido correctamente</span>
              <button
                type="button"
                onClick={() => onChange('logo_url', '')}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={subiendo === 'logo'}
              className="mt-2 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-navy/20 bg-cream/30 hover:bg-cream/50 transition-all text-sm font-medium text-navy/60 hover:text-navy"
            >
              {subiendo === 'logo' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {subiendo === 'logo' ? 'Subiendo...' : 'Seleccionar archivo'}
            </button>
          )}
        </div>

        {/* Fotos */}
        <div>
          <label className="block text-xs font-bold text-navy mb-1 uppercase tracking-wider flex items-center gap-1.5">
            <Image size={14} className="text-primary" />
            Fotos del negocio o productos (hasta 5, máx. 10MB total)
          </label>
          <input
            ref={fotosInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFotosChange}
            className="hidden"
          />
          
          {(data.fotos_url?.length || 0) > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {data.fotos_url.map((url, i) => (
                <div key={i} className="relative group">
                  <img
                    src={url}
                    alt={`Foto ${i + 1}`}
                    className="w-16 h-16 rounded-lg object-cover border border-navy/10"
                  />
                  <button
                    type="button"
                    onClick={() => removeFoto(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => fotosInputRef.current?.click()}
            disabled={(data.fotos_url?.length || 0) >= 5 || subiendo === 'foto'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-navy/20 bg-cream/30 hover:bg-cream/50 transition-all text-sm font-medium text-navy/60 hover:text-navy disabled:opacity-40"
          >
            {subiendo === 'foto' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {subiendo === 'foto' ? 'Subiendo...' : `Agregar fotos (${data.fotos_url?.length || 0}/5)`}
          </button>
        </div>

        {/* Archivos adicionales */}
        <div>
          <label className="block text-xs font-bold text-navy mb-1 uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={14} className="text-primary" />
            Archivos adicionales (PDF, imágenes — máx. 10MB)
          </label>
          <input
            ref={archivosInputRef}
            type="file"
            accept=".pdf,image/*"
            multiple
            onChange={handleArchivosChange}
            className="hidden"
          />

          {(data.archivos_extra_url?.length || 0) > 0 && (
            <div className="space-y-1 mt-2 mb-2">
              {data.archivos_extra_url.map((url, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-navy/5 rounded-lg">
                  <FileText size={14} className="text-navy/40" />
                  <span className="text-xs text-navy/60 truncate flex-1">{url.split('/').pop()}</span>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => archivosInputRef.current?.click()}
            disabled={subiendo === 'archivo'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-navy/20 bg-cream/30 hover:bg-cream/50 transition-all text-sm font-medium text-navy/60 hover:text-navy"
          >
            {subiendo === 'archivo' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {subiendo === 'archivo' ? 'Subiendo...' : 'Agregar archivos'}
          </button>
        </div>
      </div>
    </details>
  );
}
