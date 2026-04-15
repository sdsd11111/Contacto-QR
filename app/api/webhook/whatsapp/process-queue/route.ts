import { NextResponse } from 'next/server';

/**
 * Este endpoint ya no procesa la cola directamente.
 * El proceso está a cargo del Always-On Worker (lib/message-worker.ts)
 * que corre como un servicio separado en Render.
 * 
 * Esta ruta se deja para health checks del sistema.
 */
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'El procesamiento de cola está a cargo del Worker de Render (lib/message-worker.ts).',
        timestamp: new Date().toISOString()
    });
}
