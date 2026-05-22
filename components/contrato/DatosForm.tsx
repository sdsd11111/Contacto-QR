'use client';

import { useState, useMemo } from 'react';
import { User, Building2, IdCard, Phone, Mail, Hash, Globe, Tag, Check } from 'lucide-react';
import { SERVICIOS_LIST, calcularTotalServicios, generarNombresServicios } from '@/lib/contrato-utils';

interface DatosFormProps {
  data: ContratoData;
  onChange: (field: string, value: any) => void;
  onNext: () => void;
  errors: Record<string, string>;
}

export interface ContratoData {
  cliente_nombre: string;
  cliente_negocio: string;
  cliente_cedula_ruc: string;
  cliente_telefono: string;
  cliente_email: string;
  cliente_red_social: string;
  cliente_categorias: string;
  servicios_seleccionados: string[];
  monto_total: number;
  monto_anticipo: number;
}

export default function DatosForm({ data, onChange, onNext, errors }: DatosFormProps) {
  const [showErrors, setShowErrors] = useState(false);

  const montoCalculado = useMemo(() => {
    return calcularTotalServicios(data.servicios_seleccionados);
  }, [data.servicios_seleccionados]);

  const totalDisplay = data.monto_total || montoCalculado;

  const toggleServicio = (id: string) => {
    const current = data.servicios_seleccionados || [];
    const isSelected = current.includes(id);
    let nuevos: string[];
    
    if (isSelected) {
      nuevos = current.filter(s => s !== id);
    } else {
      nuevos = [...current, id];
    }

    // Actualizar servicios y auto-calcular total
    onChange('servicios_seleccionados', nuevos);
    onChange('monto_total', calcularTotalServicios(nuevos));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    // La validación real la hace el padre (handleNextStep -> validateStep)
    // que también establece los errores que se muestran abajo
    onNext();
  };

  // Servicios que sí tienen precio fijo (excluímos Auditoría que es variable)
  const serviciosConPrecio = SERVICIOS_LIST.filter(s => s.precio > 0);

  // Verificar si hay errores para mostrar el banner
  const hasVisibleErrors = showErrors && Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-navy/5 shadow-xl shadow-navy/5">
        <h2 className="text-xl font-black text-navy uppercase mb-1">Datos del cliente</h2>
        <p className="text-sm text-navy/50 mb-6">Completa la información para generar tu contrato</p>

        {/* Banner de error general */}
        {hasVisibleErrors && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <span className="text-red-500 text-lg shrink-0 mt-0.5">⚠️</span>
            <div>
              <p className="text-sm font-bold text-red-700">Revisa los campos marcados en rojo</p>
              <ul className="text-xs text-red-600 mt-1 space-y-0.5 list-disc list-inside">
                {errors.cliente_nombre && <li>Nombre completo</li>}
                {errors.cliente_telefono && <li>Teléfono / WhatsApp</li>}
                {errors.cliente_email && <li>Correo electrónico</li>}
                {errors.servicios_seleccionados && <li>Selección de servicios</li>}
                {errors.cliente_cedula_ruc && <li>Cédula/RUC: {errors.cliente_cedula_ruc}</li>}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre Completo */}
          <CampoForm
            label="Nombre completo *"
            icon={<User size={16} />}
            value={data.cliente_nombre}
            onChange={(v) => onChange('cliente_nombre', v)}
            placeholder="Ej: Juan Pérez"
            error={showErrors ? errors.cliente_nombre : undefined}
            required
          />

          {/* Nombre del Negocio */}
          <CampoForm
            label="Nombre del negocio"
            icon={<Building2 size={16} />}
            value={data.cliente_negocio}
            onChange={(v) => onChange('cliente_negocio', v)}
            placeholder="Ej: Mi Empresa S.A."
          />

          {/* Cédula o RUC */}
          <CampoForm
            label="Cédula / RUC"
            icon={<IdCard size={16} />}
            value={data.cliente_cedula_ruc}
            onChange={(v) => onChange('cliente_cedula_ruc', v)}
            placeholder="10 o 13 dígitos"
            maxLength={13}
          />

          {/* Teléfono */}
          <CampoForm
            label="Teléfono / WhatsApp *"
            icon={<Phone size={16} />}
            value={data.cliente_telefono}
            onChange={(v) => onChange('cliente_telefono', v)}
            placeholder="+593 99 999 9999"
            error={showErrors ? errors.cliente_telefono : undefined}
            required
          />

          {/* Email */}
          <CampoForm
            label="Correo electrónico *"
            icon={<Mail size={16} />}
            type="email"
            value={data.cliente_email}
            onChange={(v) => onChange('cliente_email', v)}
            placeholder="correo@ejemplo.com"
            error={showErrors ? errors.cliente_email : undefined}
            required
          />

        </div>

        {/* === SELECCIÓN DE SERVICIOS (Multi-select checkboxes) === */}
        <div className="mt-6 pt-6 border-t border-navy/5">
          <label className="block text-sm font-bold text-navy mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <Hash size={16} className="text-primary" />
            Servicios a contratar * <span className="text-xs font-normal normal-case text-navy/50">(puedes elegir uno o más)</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {serviciosConPrecio.map((servicio) => {
              const selected = (data.servicios_seleccionados || []).includes(servicio.id);
              return (
                <button
                  key={servicio.id}
                  type="button"
                  onClick={() => toggleServicio(servicio.id)}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    selected
                      ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                      : 'border-navy/10 bg-cream/30 hover:border-navy/20'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    selected ? 'bg-primary border-primary text-white' : 'border-navy/20'
                  }`}>
                    {selected && <Check size={14} strokeWidth={3} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{servicio.icono}</span>
                      <span className={`text-sm font-bold ${selected ? 'text-primary' : 'text-navy'}`}>
                        {servicio.nombre}
                      </span>
                    </div>
                    <p className="text-[11px] text-navy/50 mt-1 leading-tight">{servicio.descripcion}</p>
                    <p className="text-xs font-black text-primary mt-1">${servicio.precio} USD</p>
                  </div>
                </button>
              );
            })}
          </div>

          {showErrors && (!data.servicios_seleccionados || data.servicios_seleccionados.length === 0) && (
            <p className="text-red-500 text-xs mt-2">Selecciona al menos un servicio</p>
          )}
        </div>

        {/* === TOTAL AUTO-CALCULADO === */}
        {(data.servicios_seleccionados?.length || 0) > 0 && (
          <div className="mt-4 p-4 bg-navy text-white rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-70 font-bold">Total servicios</p>
              <p className="text-sm font-medium opacity-80">{generarNombresServicios(data.servicios_seleccionados)}</p>
            </div>
            <p className="text-2xl font-black">${totalDisplay.toFixed(2)}</p>
          </div>
        )}

        {/* Campos opcionales en acordeón visual */}
        <details className="mt-6 group">
          <summary className="text-sm font-bold text-navy/60 hover:text-navy cursor-pointer transition-colors flex items-center gap-2 select-none">
            <span className="w-5 h-5 rounded-full border border-navy/20 flex items-center justify-center text-xs group-open:bg-primary group-open:border-primary group-open:text-white transition-all">+</span>
            Más información del cliente (opcional)
          </summary>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Red Social */}
              <CampoForm
                label="Enlace a red social"
                icon={<Globe size={16} />}
                value={data.cliente_red_social}
                onChange={(v) => onChange('cliente_red_social', v)}
                placeholder="Instagram, Facebook o TikTok"
              />

              {/* Categorías */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-navy mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={16} className="text-primary" />
                  Categorías o productos que vende
                </label>
                <textarea
                  value={data.cliente_categorias}
                  onChange={(e) => onChange('cliente_categorias', e.target.value)}
                  placeholder="Ej: Electrodomésticos, ropa deportiva, accesorios..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-cream/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-navy"
                />
              </div>
            </div>
          </div>
        </details>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-10 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
        >
          Continuar →
        </button>
      </div>
    </form>
  );
}

/* Subcomponente CampoForm */
function CampoForm({
  label, icon, value, onChange, placeholder, type = 'text', error, required, maxLength
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-navy mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
        <span className="text-primary">{icon}</span>
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          className={`w-full px-4 py-3 rounded-xl border bg-cream/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-navy ${
            error ? 'border-red-400 bg-red-50' : 'border-navy/10'
          }`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          className={`w-full px-4 py-3 rounded-xl border bg-cream/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-navy ${
            error ? 'border-red-400 bg-red-50' : 'border-navy/10'
          }`}
        />
      )}
      {error && <p className="text-red-600 text-xs mt-1.5 font-medium flex items-center gap-1">⚠️ {error}</p>}
    </div>
  );
}
