/**
 * lib/contrato-utils.ts
 * Utilidades para el módulo de Contratos y Onboarding de Cliente.
 *
 * Incluye:
 * - Validación de cédula/RUC ecuatoriano
 * - Generación de hash SHA-256 para snapshots
 * - Captura de fingerprint del dispositivo
 * - Construcción del snapshot del contrato
 */

import crypto from 'crypto';

// ============================================================
// 1. VALIDACIÓN DE CÉDULA / RUC ECUATORIANO (Módulo 10)
// ============================================================

/**
 * Valida una cédula ecuatoriana (10 dígitos) usando el algoritmo Módulo 10.
 * También valida RUC (13 dígitos) verificando los últimos 3 dígitos contra
 * el código de establecimiento (001-999 para RUC válido, 000 para cédula).
 */
export function validarCedulaEcuador(cedula: string): { valida: boolean; tipo: 'cedula' | 'ruc' | 'invalido'; mensaje: string } {
    // Limpiar
    const cleaned = cedula.replace(/\D/g, '');

    if (cleaned.length === 10) {
        // Validar cédula
        if (!validarModulo10(cleaned)) {
            return { valida: false, tipo: 'invalido', mensaje: 'Cédula inválida: no pasa el algoritmo de verificación.' };
        }
        if (!cleaned.startsWith('1') && !cleaned.startsWith('2') && !cleaned.startsWith('3') && !cleaned.startsWith('4') && !cleaned.startsWith('5') && !cleaned.startsWith('6')) {
            // Las cédulas en Ecuador empiezan con 01-24 (provincias)
            const provincia = parseInt(cleaned.substring(0, 2));
            if (provincia < 1 || provincia > 24) {
                return { valida: false, tipo: 'invalido', mensaje: 'Cédula inválida: código de provincia no válido.' };
            }
        }
        return { valida: true, tipo: 'cedula', mensaje: 'Cédula válida.' };
    }

    if (cleaned.length === 13) {
        // Validar RUC (persona natural o sociedad)
        const rucProvincia = parseInt(cleaned.substring(0, 2));
        if (rucProvincia < 1 || rucProvincia > 24) {
            return { valida: false, tipo: 'invalido', mensaje: 'RUC inválido: código de provincia no válido.' };
        }

        const establecimiento = cleaned.substring(10, 13);
        if (establecimiento === '000') {
            // Es una cédula con 000 (no es RUC)
            if (validarModulo10(cleaned.substring(0, 10))) {
                return { valida: true, tipo: 'cedula', mensaje: 'Cédula válida.' };
            }
            return { valida: false, tipo: 'invalido', mensaje: 'Cédula inválida.' };
        }

        // Validar los primeros 10 dígitos del RUC
        if (!validarModulo10(cleaned.substring(0, 10))) {
            return { valida: false, tipo: 'invalido', mensaje: 'RUC inválido: base de cédula no válida.' };
        }

        return { valida: true, tipo: 'ruc', mensaje: 'RUC válido.' };
    }

    if (cleaned.length === 0) {
        return { valida: false, tipo: 'invalido', mensaje: 'Campo vacío.' };
    }

    return { valida: false, tipo: 'invalido', mensaje: `Debe tener 10 dígitos (cédula) o 13 (RUC). Ingresó ${cleaned.length}.` };
}

function validarModulo10(digitos: string): boolean {
    if (digitos.length !== 10) return false;

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const digitoVerificador = parseInt(digitos.charAt(9));
    let suma = 0;

    for (let i = 0; i < 9; i++) {
        let producto = parseInt(digitos.charAt(i)) * coeficientes[i];
        if (producto >= 10) producto -= 9;
        suma += producto;
    }

    const decenaSuperior = Math.ceil(suma / 10) * 10;
    const digitoCalculado = decenaSuperior - suma;

    return digitoCalculado === digitoVerificador;
}

// ============================================================
// 2. HASH SHA-256 para snapshot del contrato
// ============================================================

/**
 * Genera un hash SHA-256 del contenido del contrato.
 * Este hash permite verificar la integridad del contrato firmado
 * en caso de disputa: "¿Este contrato fue modificado después de la firma?"
 */
export function generarHashContrato(contenido: string): string {
    return crypto.createHash('sha256').update(contenido).digest('hex');
}

/**
 * Construye el snapshot completo del contrato como JSON string.
 * Incluye el texto LITERAL de cada sección al momento de la firma.
 * Soporta múltiples servicios seleccionados.
 */
export function construirSnapshotContrato(params: {
    cliente: {
        nombre: string;
        negocio?: string;
        cedula_ruc?: string;
        telefono: string;
        email: string;
        red_social?: string;
        categorias?: string;
    };
    facturacion?: {
        ruc?: string;
        razon_social?: string;
        direccion?: string;
    };
    servicios_seleccionados: string[];
    monto_total: number;
    monto_anticipo: number;
    terminos_texto: string;
    privacidad_texto: string;
    fecha_actual: string;
}): { snapshot_json: string; snapshot_hash: string } {
    const serviciosTexto = params.servicios_seleccionados.map(id => {
        const s = SERVICIOS_LIST.find(sv => sv.id === id);
        return s ? `- ${s.icono} ${s.nombre}: $${s.precio} USD` : `- ${id}`;
    }).join('\n');

    const snapshot = {
        version: 'v1.0',
        tipo: 'CONTRATO_SERVICIOS_ACTIVAQR',
        fecha_firma: params.fecha_actual,
        proveedor: {
            nombre: 'César Augusto Reyes Jaramillo',
            cedula: '1103421531001',
            empresa: 'ActivaQR - Grupo Empresarial Reyes',
        },
        secciones: {
            resumen: {
                titulo: 'Resumen del Servicio Contratado',
                contenido: [
                    `Cliente: ${params.cliente.nombre}`,
                    params.cliente.negocio ? `Negocio: ${params.cliente.negocio}` : null,
                    params.cliente.cedula_ruc ? `Cédula/RUC: ${params.cliente.cedula_ruc}` : null,
                    `Teléfono: ${params.cliente.telefono}`,
                    `Email: ${params.cliente.email}`,
                    params.cliente.red_social ? `Redes Sociales: ${params.cliente.red_social}` : null,
                    params.cliente.categorias ? `Categorías / Productos: ${params.cliente.categorias}` : null,
                    '',
                    'Servicios Contratados:',
                    serviciosTexto,
                    '',
                    `Monto Total: $${params.monto_total.toFixed(2)} USD`,
                    `Anticipo: $${params.monto_anticipo.toFixed(2)} USD`,
                    `Fecha de Contratación: ${params.fecha_actual}`,
                ].filter(Boolean).join('\n')
            },
            terminos_condiciones: {
                titulo: 'Términos y Condiciones del Servicio',
                contenido: params.terminos_texto
            },
            politica_privacidad: {
                titulo: 'Política de Privacidad y Tratamiento de Datos',
                contenido: params.privacidad_texto
            },
            datos_facturacion: params.facturacion?.ruc ? {
                titulo: 'Datos de Facturación',
                contenido: [
                    `RUC: ${params.facturacion.ruc}`,
                    `Razón Social: ${params.facturacion.razon_social || ''}`,
                    `Dirección: ${params.facturacion.direccion || ''}`,
                ].filter(Boolean).join('\n')
            } : null
        }
    };

    // Eliminar sección facturación si no aplica
    if (!snapshot.secciones.datos_facturacion) {
        const { datos_facturacion, ...rest } = snapshot.secciones;
        snapshot.secciones = rest as typeof snapshot.secciones;
    }

    const snapshotJson = JSON.stringify(snapshot, null, 2);
    const snapshotHash = generarHashContrato(snapshotJson);

    return { snapshot_json: snapshotJson, snapshot_hash: snapshotHash };
}

// ============================================================
// 3. FINGERPRINT DEL DISPOSITIVO (Client-side)
// ============================================================

/**
 * Define la estructura del fingerprint. Se llena desde el cliente
 * y se envía al servidor al firmar.
 */
export interface DeviceFingerprint {
    userAgent: string;
    platform: string;
    language: string;
    languages: string[];
    screenWidth: number;
    screenHeight: number;
    colorDepth: number;
    hardwareConcurrency: number;
    deviceMemory?: number;
    connectionType?: string;
    pdfViewerEnabled: boolean;
    timezone: string;
    timezoneOffset: number;
}

/**
 * Captura el fingerprint del dispositivo. Debe ejecutarse en el navegador.
 * Retorna null si se ejecuta en servidor.
 */
export function captureDeviceFingerprint(): DeviceFingerprint | null {
    if (typeof window === 'undefined') return null;

    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: Array.from(navigator.languages || []),
        screenWidth: screen.width,
        screenHeight: screen.height,
        colorDepth: screen.colorDepth,
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory: (navigator as any).deviceMemory || undefined,
        connectionType: (navigator as any).connection?.effectiveType || undefined,
        pdfViewerEnabled: navigator.pdfViewerEnabled,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
    };
}

// ============================================================
// 4. GEOLOCALIZACIÓN (Client-side)
// ============================================================

export interface GeoLocation {
    lat: number | null;
    lng: number | null;
    precision: 'exacta' | 'ciudad' | 'no_disponible';
}

/**
 * Intenta obtener la geolocalización del dispositivo.
 * No bloquea si el usuario deniega el permiso.
 */
export async function captureGeoLocation(): Promise<GeoLocation> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
        return { lat: null, lng: null, precision: 'no_disponible' };
    }

    try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000, // 1 minuto de caché
            });
        });

        return {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            precision: position.coords.accuracy < 100 ? 'exacta' : 'ciudad',
        };
    } catch (err: any) {
        if (err.code === 1) {
            // PERMISSION_DENIED
            return { lat: null, lng: null, precision: 'no_disponible' };
        }
        // TIMEOUT o POSITION_UNAVAILABLE
        return { lat: null, lng: null, precision: 'no_disponible' };
    }
}

// ============================================================
// 5. MAPEO DE SERVICIOS (con precios para auto-cálculo)
// ============================================================

export interface ServicioInfo {
    id: string;
    nombre: string;
    precio: number;
    icono: string;
    descripcion: string;
}

export const SERVICIOS_LIST: ServicioInfo[] = [
    { id: 'digital', nombre: 'Contacto Digital', precio: 35, icono: '📱', descripcion: 'Identidad digital profesional con foto, redes y QR dinámico.' },
    { id: 'business', nombre: 'Contacto Business', precio: 100, icono: '💼', descripcion: 'Vitrina digital actualizable con promociones desde tu celular.' },
    { id: 'catalogo', nombre: 'Business + Catálogo', precio: 200, icono: '📦', descripcion: 'Catálogo interactivo con pedidos vía WhatsApp.' },
    { id: 'auditoria', nombre: 'Auditoría Operativa', precio: 0, icono: '🔍', descripcion: 'Sistema de control operativo con reportes de evidencia.' },
    { id: 'web', nombre: 'Sitio Web Completo', precio: 1000, icono: '🌐', descripcion: 'Sitio web profesional con e-commerce y SEO.' },
];

export const SERVICIOS_MAP: Record<string, { nombre: string; icono: string; precio: number }> = {};
SERVICIOS_LIST.forEach(s => {
    SERVICIOS_MAP[s.id] = { nombre: `${s.nombre} ($${s.precio})`, icono: s.icono, precio: s.precio };
});

/**
 * Calcula el monto total basado en los servicios seleccionados.
 */
export function calcularTotalServicios(serviciosIds: string[]): number {
    return serviciosIds.reduce((total, id) => {
        const servicio = SERVICIOS_LIST.find(s => s.id === id);
        return total + (servicio?.precio || 0);
    }, 0);
}

/**
 * Genera la lista textual de servicios para el contrato.
 */
export function generarListaServiciosTexto(serviciosIds: string[]): string {
    return serviciosIds.map(id => {
        const s = SERVICIOS_LIST.find(sv => sv.id === id);
        return s ? `- ${s.icono} ${s.nombre}: $${s.precio} USD — ${s.descripcion}` : `- ${id}`;
    }).join('\n');
}

export function generarNombresServicios(serviciosIds: string[]): string {
    return serviciosIds.map(id => {
        const s = SERVICIOS_LIST.find(sv => sv.id === id);
        return s ? `${s.nombre} ($${s.precio})` : id;
    }).join(', ');
}

// ============================================================
// 6. TEXTO DE TÉRMINOS (PLANTILLA BASE)
// ============================================================

/**
 * Genera el texto del contrato simple para ActivaQR.
 * 
 * CONTRATO DE PRESTACIÓN DE SERVICIOS DIGITALES
 * 
 * Estilo: simple, directo, legal pero sin mucho trámite.
 * Proveedor: César Augusto Reyes Jaramillo (C.I. 1103421531001)
 * Vigencia: 1 año
 * Incluye cláusula de autogestión (clave de edición).
 */
export function generarTerminosTexto(params: {
    cliente_nombre: string;
    cliente_cedula: string;
    servicios_seleccionados: string[];
    monto_total: number;
    monto_anticipo: number;
    fecha: string;
}): string {
    const listaServicios = params.servicios_seleccionados.map(id => {
        const s = SERVICIOS_LIST.find(sv => sv.id === id);
        return s ? `  ${s.icono} ${s.nombre}` : `  ${id}`;
    }).join('\n');

    const fechaPartes = new Date().toLocaleDateString('es-EC', {
        year: 'numeric', month: 'long', day: 'numeric'
    }).split(' de ');

    const dia = fechaPartes[0];
    const mesAnio = fechaPartes.slice(1).join(' de ');

    return `
CONTRATO DE PRESTACIÓN DE SERVICIOS DIGITALES
ACTIVAQR

---oOo---

Comparecen:

Por una parte, CÉSAR AUGUSTO REYES JARAMILLO, ecuatoriano, con cédula de identidad No. 1103421531001, en adelante "EL PROVEEDOR", representante de ActivaQR.

Por otra parte, ${params.cliente_nombre}, con cédula/RUC ${params.cliente_cedula || '[POR INGRESAR]'}, en adelante "EL CONTRATANTE".

CLÁUSULA PRIMERA.— OBJETO DEL CONTRATO

EL CONTRATANTE contrata los servicios digitales de ActivaQR, los cuales son detallados a continuación:

${listaServicios}

CLÁUSULA SEGUNDA.— PLAZO Y VIGENCIA

El presente contrato tiene una vigencia de UN (1) AÑO, contado desde la fecha de suscripción. El PROVEEDOR se compromete a mantener los servicios contratados activos, funcionales y accesibles durante todo el período de vigencia, incluyendo el alojamiento web (hosting), el mantenimiento técnico y las actualizaciones necesarias para su correcto funcionamiento.

CLÁUSULA TERCERA.— OBLIGACIONES DEL PROVEEDOR

EL PROVEEDOR se obliga a:

a) Entregar los servicios contratados en los plazos acordados con EL CONTRATANTE.
b) Mantener la infraestructura técnica (hosting, dominio, base de datos) operativa durante la vigencia del contrato.
c) Realizar el mantenimiento preventivo y correctivo necesario para garantizar el funcionamiento del servicio.
d) Entregar a EL CONTRATANTE una clave de edición y acceso autónomo para que pueda modificar sus propios datos, contenidos, precios, fotos y promociones sin necesidad de depender del PROVEEDOR.
e) Brindar soporte técnico ante fallos del sistema.

CLÁUSULA CUARTA.— OBLIGACIONES DEL CONTRATANTE

EL CONTRATANTE se obliga a:

a) Cancelar el valor pactado del servicio según las condiciones acordadas.
b) Hacer uso responsable de la clave de edición entregada.
c) Entender que, al contar con clave de edición propia, los cambios menores (textos, precios, fotos, promociones) son de su exclusiva responsabilidad y no requieren intervención del PROVEEDOR.
d) Comunicar al PROVEEDOR cualquier falla técnica o necesidad que exceda el alcance del autoservicio.

CLÁUSULA QUINTA.— VALOR Y FORMA DE PAGO

El valor total del presente contrato es de ${params.monto_total.toFixed(2)} DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA ($${params.monto_total.toFixed(2)} USD). EL CONTRATANTE cancela la suma de $${params.monto_anticipo.toFixed(2)} USD como anticipo, y el saldo restante será cancelado según el acuerdo entre las partes.

CLÁUSULA SEXTA.— CONFIDENCIALIDAD

EL PROVEEDOR se compromete a mantener la más estricta confidencialidad sobre toda la información comercial, técnica y personal que EL CONTRATANTE comparta para la ejecución del servicio. Dicha información no será divulgada a terceros sin autorización expresa de EL CONTRATANTE.

CLÁUSULA SÉPTIMA.— PROPIEDAD DE LOS ACTIVOS DIGITALES

El dominio web y los activos digitales contratados permanecerán bajo administración del PROVEEDOR durante la vigencia del contrato. Una vez cancelado el valor total del servicio, la propiedad y el control serán transferidos a EL CONTRATANTE.

CLÁUSULA OCTAVA.— ACEPTACIÓN

Las partes declaran que han leído, comprenden y aceptan libre y voluntariamente todas y cada una de las cláusulas del presente contrato, firmándolo en señal de conformidad.

Firmado en la ciudad de Loja, a los ${dia} días del mes de ${mesAnio}.

_____________________________                    _____________________________
César Augusto Reyes Jaramillo                    ${params.cliente_nombre}
C.I. 1103421531001                               C.I. ${params.cliente_cedula || '[POR INGRESAR]'}
EL PROVEEDOR                                     EL CONTRATANTE

---oOo---
    `.trim();
}
