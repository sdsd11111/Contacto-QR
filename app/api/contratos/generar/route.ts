import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/contratos/generar
 * 
 * Genera un nuevo contrato (UUID + registro vacío en DB).
 * Este endpoint es llamado por el asesor/admin para crear el link
 * que se enviará al cliente.
 * 
 * Body:
 * {
 *   cliente_nombre: string;
 *   cliente_telefono: string;
 *   cliente_email: string;
 *   servicios_seleccionados: string[];   // Array de IDs: ['digital','business']
 *   monto_total: number;
 *   monto_anticipo: number;
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { 
            cliente_nombre, cliente_telefono, cliente_email,
            servicios_seleccionados, monto_total, monto_anticipo 
        } = body;

        // Validaciones básicas
        if (!cliente_nombre || !cliente_telefono || !cliente_email) {
            return NextResponse.json({ 
                error: 'Campos requeridos: cliente_nombre, cliente_telefono, cliente_email' 
            }, { status: 400 });
        }

        if (!servicios_seleccionados || !Array.isArray(servicios_seleccionados) || servicios_seleccionados.length === 0) {
            return NextResponse.json({ 
                error: 'Debe seleccionar al menos un servicio (servicios_seleccionados)' 
            }, { status: 400 });
        }

        const serviciosValidos = ['digital', 'business', 'catalogo', 'auditoria', 'web'];
        const serviciosInvalido = servicios_seleccionados.find((s: string) => !serviciosValidos.includes(s));
        if (serviciosInvalido) {
            return NextResponse.json({ 
                error: `Servicio inválido: "${serviciosInvalido}". Válidos: ${serviciosValidos.join(', ')}` 
            }, { status: 400 });
        }

        // Usar el primer servicio como principal para el ENUM, guardar todos en JSON
        const servicioPrincipal = servicios_seleccionados[0];

        const contratoId = uuidv4();
        const baseUrl = req.nextUrl.origin;
        const contratoUrl = `${baseUrl}/contrato/${contratoId}`;

        // Auto-crear tabla si no existe (dev)
        await pool.execute(`CREATE TABLE IF NOT EXISTS contratos (
            id VARCHAR(36) PRIMARY KEY,
            cliente_nombre VARCHAR(255) NOT NULL,
            cliente_negocio VARCHAR(255),
            cliente_cedula_ruc VARCHAR(20),
            cliente_telefono VARCHAR(30) NOT NULL,
            cliente_email VARCHAR(255) NOT NULL,
            cliente_red_social TEXT,
            cliente_categorias TEXT,
            facturacion_ruc VARCHAR(20),
            facturacion_razon_social VARCHAR(255),
            facturacion_direccion TEXT,
            facturacion_foto_url VARCHAR(500),
            servicio_contratado ENUM('digital','business','catalogo','auditoria','web') NOT NULL,
            servicios_seleccionados TEXT,
            monto_total DECIMAL(10,2) NOT NULL,
            monto_anticipo DECIMAL(10,2) NOT NULL,
            estado_pago ENUM('pendiente','abonado','pagado') NOT NULL DEFAULT 'pendiente',
            snapshot_json LONGTEXT NOT NULL,
            snapshot_hash VARCHAR(64) NOT NULL,
            version_terminos VARCHAR(10) NOT NULL DEFAULT 'v1.0',
            firma_nombre VARCHAR(255) NOT NULL,
            acepta_terminos TINYINT(1) NOT NULL DEFAULT 1,
            acepta_privacidad TINYINT(1) NOT NULL DEFAULT 1,
            audit_id_consentimiento VARCHAR(36),
            timestamp_firma DATETIME(3) NOT NULL,
            ip VARCHAR(45) NOT NULL,
            ubicacion_lat DECIMAL(10,7),
            ubicacion_lng DECIMAL(10,7),
            ubicacion_precision ENUM('exacta','ciudad','no_disponible') DEFAULT 'no_disponible',
            dispositivo_fingerprint JSON,
            contrato_url VARCHAR(500),
            logo_url VARCHAR(500),
            fotos_url JSON,
            archivos_extra_url JSON,
            created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

        // Insertar registro inicial en la tabla
        await pool.execute(
            `INSERT INTO contratos (
                id, cliente_nombre, cliente_telefono, cliente_email,
                servicio_contratado, servicios_seleccionados,
                monto_total, monto_anticipo,
                estado_pago, contrato_url,
                snapshot_json, snapshot_hash, version_terminos,
                firma_nombre, acepta_terminos, acepta_privacidad,
                timestamp_firma, ip, ubicacion_precision,
                dispositivo_fingerprint, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, '', '', 'v1.0', '', 0, 0, NOW(), '', 'no_disponible', '{}', NOW(), NOW())`,
            [
                contratoId, cliente_nombre, cliente_telefono, cliente_email,
                servicioPrincipal, JSON.stringify(servicios_seleccionados),
                monto_total || 0, monto_anticipo || 0,
                contratoUrl
            ]
        );

        return NextResponse.json({
            success: true,
            contrato_id: contratoId,
            contrato_url: contratoUrl,
            datos: {
                cliente_nombre,
                servicios_seleccionados,
                monto_total,
                monto_anticipo
            }
        });

    } catch (error: any) {
        console.error('[Contratos] Error al generar contrato:', error);
        return NextResponse.json({ error: 'Error al generar el contrato' }, { status: 500 });
    }
}
