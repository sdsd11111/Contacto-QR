/**
 * ActivaQR WhatsApp Widget v1.0
 * Botón flotante de WhatsApp embebible para clientes de ActivaQR
 * 
 * 📦 Uso:
 *   <script src="https://activaqr.com/widget.js"
 *           data-phone="593963425323"
 *           data-message="Hola%2C%20quiero%20informaci%C3%B3n"
 *           data-position="right"
 *           data-color="#25D366"
 *           data-brand="ActivaQR"></script>
 * 
 * ⚙️ Parámetros:
 *   data-phone   | Número de WhatsApp (código de país + número, sin +)
 *   data-message | Mensaje predefinido (URL encoded)
 *   data-position| left | right (default: right)
 *   data-color   | Color del botón (default: #25D366)
 *   data-brand   | Nombre que aparece en la burbuja (default: ActivaQR)
 */

(function () {
    'use strict';

    const SCRIPT = document.currentScript;

    // ─── Configuración ───────────────────────────────────────────
    const CONFIG = {
        phone: SCRIPT?.getAttribute('data-phone') || '593963425323',
        message: SCRIPT?.getAttribute('data-message') || 'Hola%2C%20quiero%20informaci%C3%B3n',
        position: SCRIPT?.getAttribute('data-position') || 'right',
        color: SCRIPT?.getAttribute('data-color') || '#25D366',
        brand: SCRIPT?.getAttribute('data-brand') || 'ActivaQR',
        apiEndpoint: SCRIPT?.getAttribute('data-api') || 'https://www.activaqr.com/api/widget',
    };

    // ─── Estilos ─────────────────────────────────────────────────
    const STYLE_ID = 'activaqr-widget-styles';
    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            @keyframes activaqr-widget-pulse {
                0% { transform: scale(1); box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
                50% { transform: scale(1.08); box-shadow: 0 6px 25px rgba(0,0,0,0.3); }
                100% { transform: scale(1); box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
            }
            @keyframes activaqr-widget-fadeIn {
                from { opacity: 0; transform: translateY(20px) scale(0.9); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes activaqr-widget-tooltipIn {
                from { opacity: 0; transform: translateY(10px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .activaqr-widget-container {
                position: fixed;
                bottom: 24px;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                animation: activaqr-widget-fadeIn 0.4s ease-out;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .activaqr-widget-container.position-left {
                left: 24px;
            }
            .activaqr-widget-container.position-right {
                right: 24px;
            }
            .activaqr-widget-tooltip {
                background: white;
                color: #1a1a1a;
                padding: 12px 18px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 20px rgba(0,0,0,0.12);
                animation: activaqr-widget-tooltipIn 0.3s ease-out;
                position: relative;
                cursor: pointer;
                max-width: 260px;
                text-align: center;
                line-height: 1.4;
                border: 1px solid rgba(0,0,0,0.05);
            }
            .activaqr-widget-tooltip::after {
                content: '';
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 8px solid white;
            }
            .activaqr-widget-tooltip .close-tooltip {
                position: absolute;
                top: -6px;
                right: -6px;
                width: 20px;
                height: 20px;
                background: #e0e0e0;
                border: none;
                border-radius: 50%;
                font-size: 12px;
                line-height: 20px;
                text-align: center;
                cursor: pointer;
                color: #666;
                padding: 0;
            }
            .activaqr-widget-tooltip .close-tooltip:hover {
                background: #ccc;
            }
            .activaqr-widget-button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
                animation: activaqr-widget-pulse 2s ease-in-out infinite;
                position: relative;
                text-decoration: none;
            }
            .activaqr-widget-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(0,0,0,0.3);
            }
            .activaqr-widget-button svg {
                width: 32px;
                height: 32px;
                fill: white;
            }
            .activaqr-widget-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                width: 22px;
                height: 22px;
                background: #ff4444;
                border: 2px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 11px;
                font-weight: bold;
            }
            @media (max-width: 640px) {
                .activaqr-widget-container { bottom: 20px; }
                .activaqr-widget-container.position-left { left: 16px; }
                .activaqr-widget-container.position-right { right: 16px; }
                .activaqr-widget-button { width: 54px; height: 54px; }
                .activaqr-widget-button svg { width: 28px; height: 28px; }
                .activaqr-widget-tooltip { font-size: 13px; padding: 10px 14px; max-width: 220px; }
            }
        `;
        document.head.appendChild(style);
    }

    // ─── Crear elementos ─────────────────────────────────────────
    const container = document.createElement('div');
    container.className = `activaqr-widget-container position-${CONFIG.position}`;

    // Tooltip / burbuja de texto
    const tooltip = document.createElement('div');
    tooltip.className = 'activaqr-widget-tooltip';
    tooltip.id = 'activaqr-widget-tooltip';
    tooltip.innerHTML = `
        <button class="close-tooltip" id="activaqr-close-tooltip">✕</button>
        💬 ¡Hola! ¿En qué podemos ayudarte?
    `;

    // Botón principal
    const button = document.createElement('a');
    button.className = 'activaqr-widget-button';
    button.id = 'activaqr-widget-button';
    button.href = `https://wa.me/${CONFIG.phone}?text=${CONFIG.message}`;
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
    button.style.background = CONFIG.color;
    button.setAttribute('aria-label', `Chatear con ${CONFIG.brand} por WhatsApp`);
    button.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
    `;

    // ─── Evento: click en botón → tracking + analytics ──────────
    button.addEventListener('click', function (e) {
        // Tracking: enviar evento al API de ActivaQR
        try {
            const payload = {
                phone: CONFIG.phone,
                message: decodeURIComponent(CONFIG.message),
                visitorId: getVisitorId(),
                url: window.location.href,
                referrer: document.referrer || '',
                timestamp: new Date().toISOString(),
            };
            // Fire-and-forget (no bloquea la apertura de WhatsApp)
            fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true,
            }).catch(() => { /* fallo silencioso */ });
        } catch (e) { /* ignora errores de tracking */ }
    });

    // ─── Tooltip: cerrar al hacer clic en ✕ ──────────────────────
    tooltip.querySelector('#activaqr-close-tooltip')?.addEventListener('click', function (e) {
        e.stopPropagation();
        tooltip.style.display = 'none';
        // Guardar preferencia para no mostrar de nuevo
        try { localStorage.setItem('activaqr-widget-tooltip-hidden', 'true'); } catch (e) { }
    });

    // Auto-cerrar tooltip si ya se ocultó antes
    try {
        if (localStorage.getItem('activaqr-widget-tooltip-hidden') === 'true') {
            tooltip.style.display = 'none';
        }
    } catch (e) { }

    // ─── Ensamblar ───────────────────────────────────────────────
    container.appendChild(tooltip);
    container.appendChild(button);
    document.body.appendChild(container);

    // ─── Helper: Visitor ID ──────────────────────────────────────
    function getVisitorId() {
        try {
            let vid = localStorage.getItem('activaqr-visitor-id');
            if (!vid) {
                vid = 'visitor_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
                localStorage.setItem('activaqr-visitor-id', vid);
            }
            return vid;
        } catch (e) {
            return 'visitor_' + Date.now();
        }
    }

    console.log(`[ActivaQR Widget] ✅ Widget cargado — ${CONFIG.brand} (${CONFIG.phone})`);
})();
