# Estrategia de Popups: Maximización de Conversión

Esta estrategia utiliza 3 momentos clave de comportamiento de usuario para rescatar visitas que se irían sin comprar.

---

## 1. Exit-Intent Popup: El "Mini-Test" de Conciencia
**Objetivo:** Detener al usuario que abandona haciéndole una pregunta dolorosa que lo califique.

*   **Trigger (Disparador):** Intención de salida (mouse saliendo de la ventana en desktop, o movimiento de scroll rápido hacia arriba en móvil tras 10s).
*   **Diseño Sugerido:**
    *   Fondo: Blanco limpio, sombra fuerte.
    *   Imagen: Icono de alerta o signo de interrogación amarillo.
    *   Estilo: Formato "Chat" o "Notificación del Sistema".

**Copy:**
*   **Headline:** 🛑 Espera... una pregunta rápida.
*   **Cuerpo:** ¿Sabes cuántos trabajos perdiste este mes solo porque no encontraron tu número en la agenda?
    *   [Opción A] Ninguno, mis clientes son ordenados.
    *   [Opción B] Probablemente varios... (¡Quiero solucionarlo!)
*   **Acción:**
    *   Si elige A --> Cierra popup.
    *   Si elige B --> Redirige a sección de Precios o abre WhatsApp directo con mensaje: *"Hola, creo que estoy perdiendo trabajos por mi contacto..."*.

---

## 2. Scroll Popup (50%): La Prueba Social
**Objetivo:** Reforzar confianza cuando el usuario ya mostró interés (bajó la mitad de la página).

*   **Trigger:** Al llegar al 50% de la altura de la página.
*   **Diseño Sugerido:**
    *   "Toast" o notificación pequeña en la esquina inferior derecha (Desktop) o inferior central (Móvil).
    *   Foto circular de una persona real.

**Copy:**
*   **Headline:** 👷‍♂️ De "Juan ????" a "Juan Eléctrico"
*   **Cuerpo:** "Mis clientes me decían que nunca encontraban mi número. Desde que les paso mi contacto digital, me llaman el triple porque salgo primero en su lista."
*   **Subtexto:** - Roberto, Electricista en Guayaquil.
*   **CTA:** [ Ver cómo lo hizo él -> ] (Scroll suave a la sección de beneficios).

---

## 3. Time-Delayed Popup (45s): El Empujón Final (Oferta)
**Objetivo:** Convertir a los indecisos que llevan tiempo leyendo pero no actúan.

*   **Trigger:** 45 segundos de permanencia en la página.
*   **Regla:** NO mostrar si ya compró o si cerró el Exit-Intent hace poco.
*   **Diseño Sugerido:**
    *   Diseño tipo "Cupón de Regalo" con bordes punteados.
    *   Color llamativo (Amarillo o Rojo suave).

**Copy:**
*   **Headline:** 🎁 Oferta Flash de Lanzamiento
*   **Cuerpo:** Te veo interesado. Queremos que pruebes el servicio hoy.
    Llévate tu **Tarjeta Profesional por solo $8** (en lugar de $10).
    *Solo valido si pides tu tarjeta en los próximos 15 minutos.*
*   **CTA Principal:** [ Reclamar Descuento de $2 por WhatsApp 👉 ]
*   **CTA Secundario (Texto):** No gracias, prefiero pagar precio normal.

---

## Resumen Técnico de Implementación

| Tipo de Popup | Disparador | Frecuencia | Prioridad |
| :--- | :--- | :--- | :--- |
| **Exit Intent** | Salida de pantalla | 1 vez por sesión | Alta |
| **Scroll (Testimonio)** | 50% Scroll | Cada vez que carga | Media |
| **Time (Oferta)** | 45 segundos | 1 vez cada 3 días | Baja (Solo si no convirtió) |
