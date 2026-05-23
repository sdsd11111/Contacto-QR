'use client';

import { useState, useEffect } from 'react';

export default function PrivacidadForm() {
    const [telefono, setTelefono] = useState('');
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [aceptaComercial, setAceptaComercial] = useState(false);
    const [aceptaExito, setAceptaExito] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'invalid_url'>('idle');
    const [auditId, setAuditId] = useState<string | null>(null);

    // Si viene un teléfono en la URL (ej: /privacidad?tel=593963410409), lo pre-cargamos
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const telParam = urlParams.get('tel');
        if (telParam) {
            setTelefono(telParam);
        } else {
            setStatus('invalid_url');
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/privacidad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telefono,
                    nombre,
                    email,
                    acepta_comercial: aceptaComercial,
                    acepta_exito: aceptaExito
                })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setAuditId(data.auditId);
            } else {
                setStatus('error');
                console.error(data.error);
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-green-50 text-green-800 p-8 rounded-2xl border border-green-200 text-center mt-10">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-2xl font-bold mb-2">¡Autorización Registrada!</h3>
                <p className="mb-4">Tu consentimiento ha sido guardado de forma segura.</p>
                <p className="text-sm opacity-70 mb-4">ID de Auditoría (Guarda esto para tus registros):<br /> <span className="font-mono">{auditId}</span></p>
                <p className="font-bold">Por favor, regresa a WhatsApp. Alejandra te confirmará en unos segundos.</p>
            </div>
        );
    }

    if (status === 'invalid_url') {
        return (
            <div className="bg-red-50 text-red-800 p-8 rounded-2xl border border-red-200 text-center mt-10">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold mb-2">Enlace de Seguridad Inválido</h3>
                <p className="mb-4">Para garantizar tu seguridad y evitar la suplantación de identidad, este formulario solo puede ser accedido a través del enlace único generado en WhatsApp.</p>
                <p className="font-bold">Por favor, regresa al chat y haz clic en el enlace proporcionado por Alejandra.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-navy/5 space-y-6 mt-10">
            <h2 className="text-2xl font-black text-navy uppercase">Formulario de Activación de Identidad Digital</h2>
            <p className="text-navy/70 mb-6">Por favor, completa tus datos para autorizarnos legalmente según la LOPDP a enviarte la información solicitada.</p>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-navy mb-1 uppercase tracking-wider">Tu Nombre y Apellido *</label>
                    <input 
                        type="text" 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-cream/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="Ej: Carlos Mendoza"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        disabled={status === 'loading'}
                    />
                </div>
                
                <div className="bg-cream/30 p-4 rounded-xl border border-navy/10">
                    <label className="block text-sm font-bold text-navy mb-1 uppercase tracking-wider">WhatsApp que estás vinculando</label>
                    <div className="text-lg font-mono font-bold text-primary">
                        +{telefono}
                    </div>
                    <p className="text-xs text-navy/50 mt-1">(Este dato se carga automáticamente desde el chat por tu seguridad).</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-navy mb-1 uppercase tracking-wider">Correo Electrónico (Opcional)</label>
                    <input 
                        type="email" 
                        className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-cream/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="tucorreo@empresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === 'loading'}
                    />
                    <p className="text-xs text-navy/50 mt-1">(Para enviarte tu respaldo legal de autorización).</p>
                </div>

                <div className="mt-8 space-y-4 pt-6 border-t border-navy/5">
                    <h3 className="font-bold text-navy uppercase text-sm">Tus Permisos:</h3>
                    
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="pt-1">
                            <input 
                                type="checkbox" 
                                required
                                checked={aceptaComercial}
                                onChange={(e) => setAceptaComercial(e.target.checked)}
                                disabled={status === 'loading'}
                                className="w-5 h-5 rounded border-navy/20 text-primary focus:ring-primary"
                            />
                        </div>
                        <span className="text-sm text-navy/80 group-hover:text-navy transition-colors">
                            <strong>Autorización Obligatoria:</strong> Acepto la Política de Privacidad y autorizo a ActivaQR a contactarme por WhatsApp, entregarme su VCard y registrar mis datos en sus servidores propios alojados en Hostdoom (Estados Unidos), bajo acuerdos de tratamiento de datos que garantizan niveles de protección adecuados. En ningún caso mis datos son compartidos ni transferidos a terceros sin mi consentimiento explícito.
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="pt-1">
                            <input 
                                type="checkbox" 
                                checked={aceptaExito}
                                onChange={(e) => setAceptaExito(e.target.checked)}
                                disabled={status === 'loading'}
                                className="w-5 h-5 rounded border-navy/20 text-primary focus:ring-primary"
                            />
                        </div>
                        <span className="text-sm text-navy/80 group-hover:text-navy transition-colors">
                            <strong>Autorización Caso de Éxito (Opcional):</strong> Autorizo que mi nombre y marca aparezcan en la web como testimonio de éxito tras mi automatización.
                        </span>
                    </label>
                </div>
            </div>

            {status === 'error' && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium">
                    Hubo un problema al registrar tu consentimiento. Por favor, intenta de nuevo o avísanos por WhatsApp.
                </div>
            )}

            <button 
                type="submit" 
                disabled={status === 'loading' || !aceptaComercial}
                className="w-full bg-primary text-white font-black uppercase tracking-widest py-4 px-6 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg shadow-primary/20"
            >
                {status === 'loading' ? 'Procesando Firma Segura...' : 'Firmar y Recibir Información'}
            </button>
            <p className="text-center text-xs text-navy/40 mt-4">Tus datos están protegidos y encriptados. Puedes darte de baja en cualquier momento con solo escribir "quiero darme de baja".</p>
        </form>
    );
}
