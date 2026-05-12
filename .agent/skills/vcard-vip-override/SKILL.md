---
name: ActivaQR-VIP-Override
description: "Protocolo para personalizar vCards estructurales sin alterar el código core. Define el uso de json_override."
---

# ActivaQR Protocolo VIP Override (v1.0)

Este es un protocolo técnico y un estándar de operación (Skill de Segundo Orden) derivado del Córtex Maestro, creado para documentar cómo personalizamos `.vcf` nativos para clientes VIP sin tocar la lógica central del SaaS de ActivaQR.

## 🎯 El Problema
El estándar `vCard` tiene `X-ABLabel` definidos estáticamente (ej. "Trabajo", "Perfil", "Ubicación"). Algunos clientes premium (ej. Carlos Vasquez) exigen que sus enlaces digan los nombres exactos de sus tiendas u ofertas (ej. "LITOS ink tattoo") en la vCard descargada.

## ⚙️ La Solución Arquitectónica: Inyección Tolerante a Fallos

Nunca se altera la Generación Base. En su lugar, usamos el campo opcional **`json_override`** en la base de datos para ese usuario específico.

### Flujo de Trabajo (Para Agentes Futuros):
1.  **Edición**: Solo durante la administración manual, el administrador inyecta un payload JSON en `registraya_vcard_registros.json_override`.
2.  **Generación Habitual**: La ruta `app/api/vcard/[slug]/route.ts` renderiza el archivo `.vcf` normalmente como texto.
3.  **Inyección en Tiempo de Ejecución**: Justo antes del `return`, el código intercepta la variable de la vCard:
    ```javascript
    if (user.json_override) {
        try {
            const overrides = JSON.parse(user.json_override);
            for (const [key, value] of Object.entries(overrides)) {
                // Reemplazo silencioso y global
                vcard = vcard.replace(new RegExp(key, 'g'), value as string);
            }
        } catch(e) {
            // SILENT FAIL: Nunca romper la descarga.
        }
    }
    ```

### ⚠️ Reglas de Intervención Agentil (Para Antigravity Agents)
1.  **NO TOUCH**: Nunca intentes "mejorar" el generador de vCards agregándole lógica in-line para clientes específicos.
2.  **Si piden un caso especial**: Solo dile al administrador que pegue el JSON en su panel. Ejemplo de JSON válido:
    ```json
    {
      "Estudio de Tatuajes": "LITOS ink tattoo",
      "Vape & Smoke Shop": "LITOS vape shop"
    }
    ```
3.  **Filosofía**: "Si el SaaS central funciona, no se toca. Los caprichos van por bypass seguro."
