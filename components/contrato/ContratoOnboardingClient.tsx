'use client';

import { useState, useEffect, useCallback } from 'react';
import StepIndicator from './StepIndicator';
import DatosForm, { ContratoData } from './DatosForm';
import DatosFacturacion from './DatosFacturacion';
import ContratoDinamico from './ContratoDinamico';
import SubidaMateriales from './SubidaMateriales';
import FirmaSection, { FirmaExitosa } from './FirmaSection';
import { captureDeviceFingerprint, captureGeoLocation, validarCedulaEcuador, calcularTotalServicios } from '@/lib/contrato-utils';
import type { DeviceFingerprint, GeoLocation } from '@/lib/contrato-utils';

const STEPS = [
  { id: 'datos', label: 'Datos', icon: '1' },
  { id: 'contrato', label: 'Contrato', icon: '2' },
  { id: 'firma', label: 'Firma', icon: '3' },
];

const STORAGE_KEY_PREFIX = 'contrato_draft_';

interface ContratoOnboardingClientProps {
  contratoId: string;
}

export default function ContratoOnboardingClient({ contratoId }: ContratoOnboardingClientProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [firmado, setFirmado] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('resumen');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showUploadSection, setShowUploadSection] = useState(false);

  // Datos del formulario
  const [formData, setFormData] = useState<ContratoData>({
    cliente_nombre: '',
    cliente_negocio: '',
    cliente_cedula_ruc: '',
    cliente_telefono: '',
    cliente_email: '',
    cliente_red_social: '',
    cliente_categorias: '',
    servicios_seleccionados: [],
    monto_total: 0,
    monto_anticipo: 0,
  });

  // Datos de facturación
  const [facturacionData, setFacturacionData] = useState({
    facturacion_ruc: '',
    facturacion_razon_social: '',
    facturacion_direccion: '',
    facturacion_foto_url: '',
  });

  // Archivos subidos
  const [materialesData, setMaterialesData] = useState({
    logo_url: '',
    fotos_url: [] as string[],
    archivos_extra_url: [] as string[],
  });

  // Firma
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [firmaNombre, setFirmaNombre] = useState('');

  // Pago (Sección D)
  const [paymentOption, setPaymentOption] = useState<'completo' | 'anticipo_porcentaje' | 'anticipo_valor'>('completo');
  const [paymentValue, setPaymentValue] = useState(50);

  // Producto creado post-firma
  const [productoCreado, setProductoCreado] = useState<{ id: string; slug: string } | null>(null);

  // Datos de pago para mostrar después de firmar
  const [pagoData, setPagoData] = useState<{
    monto: number;
    contratoId: string;
    cliente: { nombre: string; email: string; telefono: string };
  } | null>(null);

  // Metadatos capturados
  const [fingerprint, setFingerprint] = useState<DeviceFingerprint | null>(null);
  const [ubicacion, setUbicacion] = useState<GeoLocation>({ lat: null, lng: null, precision: 'no_disponible' });

  // Auto-guardado en localStorage
  const storageKey = `${STORAGE_KEY_PREFIX}${contratoId}`;

  // Cargar datos guardados al montar
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.facturacionData) setFacturacionData(parsed.facturacionData);
        if (parsed.materialesData) setMaterialesData(parsed.materialesData);
        if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep);
      } catch (e) {
        // Ignorar errores de parse
      }
    }
  }, [storageKey]);

  // Auto-guardar en localStorage cuando cambian los datos
  useEffect(() => {
    const data = { formData, facturacionData, materialesData, currentStep };
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [formData, facturacionData, materialesData, currentStep, storageKey]);

  // Capturar fingerprint y geolocalización al montar
  useEffect(() => {
    const fp = captureDeviceFingerprint();
    if (fp) setFingerprint(fp);

    captureGeoLocation().then(setUbicacion);
  }, []);

  // Validación de campos al cambiar paso
  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.cliente_nombre.trim()) {
        newErrors.cliente_nombre = '⚠️ Ingresa tu nombre completo para continuar';
      }
      if (!formData.cliente_telefono.trim()) {
        newErrors.cliente_telefono = '⚠️ Ingresa tu número de teléfono o WhatsApp';
      }
      if (!formData.cliente_email.trim()) {
        newErrors.cliente_email = '⚠️ Ingresa tu correo electrónico';
      }
      if (!formData.servicios_seleccionados || formData.servicios_seleccionados.length === 0) {
        newErrors.servicios_seleccionados = '⚠️ Selecciona al menos un servicio de la lista';
      }

      // Validar cédula si fue ingresada
      if (formData.cliente_cedula_ruc.trim()) {
        const val = validarCedulaEcuador(formData.cliente_cedula_ruc);
        if (!val.valida) newErrors.cliente_cedula_ruc = val.mensaje;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFacturacionChange = (field: string, value: any) => {
    setFacturacionData(prev => ({ ...prev, [field]: value }));
  };

  const handleMaterialesChange = (field: string, value: any) => {
    setMaterialesData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep === 0 && !validateStep(0)) return;
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // --- ENVÍO DEL CONTRATO ---
  const handleSubmit = async () => {
    setSubmitError(null);

    if (!aceptaTerminos || !aceptaPrivacidad) {
      setSubmitError('Debes aceptar los términos y la política de privacidad para continuar.');
      return;
    }

    if (firmaNombre.trim().length < 3) {
      setSubmitError('Escribe tu nombre completo para firmar.');
      return;
    }

    setSubmitting(true);

    try {
      // Guardar datos en DB (PATCH)
      const patchBody = {
        ...formData,
        ...facturacionData,
        ...materialesData,
      };

      const patchRes = await fetch(`/api/contratos/${contratoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchBody),
      });

      if (!patchRes.ok) {
        const patchErr = await patchRes.text();
        let errMsg = 'Error al guardar datos';
        try { const parsed = JSON.parse(patchErr); errMsg = parsed.error || errMsg; } catch {}
        throw new Error(errMsg);
      }

      // Firmar el contrato
      const firmarRes = await fetch(`/api/contratos/${contratoId}/firmar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firma_nombre: firmaNombre.trim(),
          dispositivo_fingerprint: fingerprint,
          ubicacion: ubicacion,
          archivos_subidos: {
            logo_url: materialesData.logo_url,
            fotos_url: materialesData.fotos_url,
            archivos_extra_url: materialesData.archivos_extra_url,
          },
        }),
      });

      const firmarData = await firmarRes.json();

      if (!firmarRes.ok) {
        throw new Error(firmarData?.error || 'Error al firmar el contrato');
      }

      // Capturar producto creado
      if (firmarData.producto) {
        setProductoCreado(firmarData.producto);
      }

      // Limpiar localStorage
      localStorage.removeItem(storageKey);

      // Mostrar pantalla de pago con PayPhone
      const montoAPagar = paymentOption === 'completo'
        ? (formData.monto_total || 0)
        : paymentOption === 'anticipo_porcentaje'
          ? (formData.monto_total || 0) * paymentValue / 100
          : paymentValue;

      setPagoData({
        monto: formData.monto_total || 0,
        contratoId,
        cliente: {
          nombre: formData.cliente_nombre,
          email: formData.cliente_email,
          telefono: formData.cliente_telefono,
        }
      });
      setFirmado(true);

    } catch (err: any) {
      console.error('[Contrato] Error al enviar:', err);
      setSubmitError(err.message || 'Ocurrió un error al procesar la firma. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // ------ RENDER ------
  if (firmado) {
    return (
      <main className="min-h-screen bg-cream py-20 px-6 font-sans text-navy">
        <FirmaExitosa contratoId={contratoId} producto={productoCreado} pagoData={pagoData} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream py-20 px-6 font-sans text-navy">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">
            Contrato <span className="text-primary">ActivaQR</span>
          </h1>
          {currentStep < 2 && (
            <p className="text-navy/60 font-medium mt-2">
              Completa los datos para generar tu contrato. Todo en una misma página, sin redirecciones.
            </p>
          )}
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Paso 1: Datos del cliente */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <DatosForm
              data={formData}
              onChange={handleFormChange}
              onNext={handleNextStep}
              errors={errors}
            />
          </div>
        )}

        {/* Paso 2: Contrato + Materiales + Facturación */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <ContratoDinamico
              data={formData}
              contratoId={contratoId}
              expandedSection={expandedSection}
              onToggleSection={toggleSection}
              aceptaTerminos={aceptaTerminos}
              aceptaPrivacidad={aceptaPrivacidad}
              onToggleTerminos={() => setAceptaTerminos(!aceptaTerminos)}
              onTogglePrivacidad={() => setAceptaPrivacidad(!aceptaPrivacidad)}
            />

            <SubidaMateriales
              data={materialesData}
              onChange={handleMaterialesChange}
            />

            <DatosFacturacion
              data={facturacionData}
              onChange={handleFacturacionChange}
            />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(0)}
                className="px-8 py-4 bg-navy text-white font-bold uppercase tracking-widest rounded-xl hover:bg-navy/80 transition-all shadow-md"
              >
                ← Atrás
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-10 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Firma */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Mini resumen del contrato */}
            <div className="bg-navy/5 p-4 rounded-xl text-xs text-navy/60 space-y-1">
              <p><strong className="text-navy">Cliente:</strong> {formData.cliente_nombre}</p>
              <p><strong className="text-navy">Servicios:</strong> {formData.servicios_seleccionados?.join(', ') || '—'}</p>
              <p><strong className="text-navy">Total:</strong> ${(formData.monto_total || 0).toFixed(2)} USD</p>
              {formData.cliente_cedula_ruc && <p><strong className="text-navy">Cédula/RUC:</strong> {formData.cliente_cedula_ruc}</p>}
            </div>

            <FirmaSection
              aceptaTerminos={aceptaTerminos}
              aceptaPrivacidad={aceptaPrivacidad}
              firmaNombre={firmaNombre}
              onToggleTerminos={() => setAceptaTerminos(!aceptaTerminos)}
              onTogglePrivacidad={() => setAceptaPrivacidad(!aceptaPrivacidad)}
              onFirmaChange={setFirmaNombre}
              onSubmit={handleSubmit}
              submitting={submitting}
              error={submitError}
            />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-8 py-4 bg-navy text-white font-bold uppercase tracking-widest rounded-xl hover:bg-navy/80 transition-all shadow-md"
              >
                ← Atrás
              </button>
            </div>
          </div>
        )}

        {/* Footer informativo */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-navy/30 leading-relaxed">
            Al completar este proceso, tu contrato queda registrado con un hash criptográfico único, 
            la fecha y hora exacta, la IP del dispositivo y tus datos de geolocalización.
            Este documento tiene validez como firma electrónica según la LOPDP de Ecuador.
          </p>
        </div>
      </div>
    </main>
  );
}
