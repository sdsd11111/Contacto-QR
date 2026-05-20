1. Datos exactos requeridos (En orden de prioridad)
Para registrar y generar el contacto digital esencial (.vcf) de $35, el backend requiere los siguientes datos. Los hemos dividido en obligatorios (para que la vCard compile correctamente) y recomendados de alta prioridad.

Campos Obligatorios:
email (String): Identificador único del cliente. Sirve para validar si ya está registrado o crear su cuenta.
whatsapp (String): El número celular (incluyendo código de país, ej: +593999999999). Este número es limpiado y procesado por el backend para generar los enlaces nativos de llamada y el link https://wa.me/.
tipo_perfil (Enum: 'persona' o 'negocio'): Define la estructura del contacto en la agenda del celular.
Si tipo_perfil es 'persona':
nombres (String): Nombre(s) de pila del usuario.
apellidos (String): Apellido(s) del usuario.
Si tipo_perfil es 'negocio':
nombre_negocio (String): Nombre comercial del negocio.
contacto_nombre (String): Nombre del representante.
contacto_apellido (String): Apellido del representante.
plan (String): Debe enviarse exactamente el valor "contacto" para indicar que corresponde al plan esencial de $35.
Campos de Alta Prioridad (Comerciales y de Redes):
profesion (String): Cargo o área de especialización (mapeado al campo TITLE del VCF).
empresa (String): Organización o lugar de trabajo (mapeado al campo ORG del VCF, si aplica).
bio (String): Descripción resumida del profesional o negocio (va dentro de NOTE).
productos_servicios (String): Listado directo de servicios o productos que el cliente ofrece (se concatena dentro de NOTE).
direccion (String): Dirección física de la oficina o local comercial (mapeado al campo ADR del VCF).
web (String): Enlace al sitio web del cliente (mapeado al campo URL del VCF).
Redes Sociales (Strings con URLs completas): instagram, facebook, linkedin, tiktok, youtube, x. Mapeados a enlaces directos y perfiles nativos de iOS (X-SOCIALPROFILE).
2. Especificación de la Imagen / Logo del Cliente
Para incluir la foto o logotipo del cliente dentro del archivo VCF de forma que se muestre en la agenda del celular, se debe seguir el siguiente flujo técnico:

Formato de entrega al Webhook: Debe ser una URL pública y estática (foto_url) que devuelva directamente el archivo binario de la imagen (formatos válidos: JPEG, PNG o WEBP).
Rol del Chatbot: El chatbot debe recibir la foto del usuario en el chat, subirla a un almacenamiento en la nube (como Supabase Storage, AWS S3, Cloudinary o un CDN) y obtener la URL pública de la imagen para incluirla en el JSON final.
Procesamiento interno del Backend: Al invocar el endpoint de descarga del VCF, el backend de ActivaQR realiza lo siguiente:
Descarga el archivo desde foto_url.
Utiliza la librería Sharp para redimensionar la imagen a un máximo de 400x400 píxeles (ajuste proporcional interno) y la exporta en formato JPEG con 80% de calidad para evitar archivos .vcf excesivamente pesados (que podrían ser rechazados por las agendas de Android/iOS).
Codifica los bytes de la imagen a una cadena Base64.
Inserta el parámetro PHOTO;ENCODING=b;TYPE=JPEG: plegando la cadena Base64 con saltos de línea cada 74 caracteres (\r\n) según la especificación RFC 6350 (vCard 4.0).
3. Estructura del Payload JSON para el Webhook
El chatbot debe realizar una petición HTTP POST enviando un cuerpo con formato application/json al endpoint del webhook (ej: /api/vcard/register o tu webhook de automatización intermedia).

Ejemplo de Payload JSON Estructurado:
json


{
  "email": "contacto@estudiojuridico.com",
  "whatsapp": "+593998765432",
  "tipo_perfil": "negocio",
  "nombre_negocio": "Reyes & Asociados Abogados",
  "contacto_nombre": "Cesar",
  "contacto_apellido": "Reyes",
  "plan": "contacto",
  "foto_url": "https://cdn.activaqr.com/uploads/foto_perfil_cesar.jpg",
  "profesion": "Abogado Corporativo",
  "bio": "Especialistas en defensa tributaria y derecho societario con más de 10 años de experiencia.",
  "productos_servicios": "- Asesoría legal mercantil\n- Defensa ante entes tributarios\n- Constitución de compañías",
  "direccion": "Av. de los Granados N34 y Eloy Alfaro, Quito, Ecuador",
  "web": "https://www.reyesabogados.com",
  "instagram": "https://instagram.com/reyesabogados",
  "facebook": "https://facebook.com/reyesabogados",
  "linkedin": "https://linkedin.com/company/reyesabogados",
  "etiquetas": "abogado, asesoría legal, derecho corporativo, quito, defensa fiscal",
  "status": "pendiente"
}
IMPORTANT

Por políticas de seguridad de la plataforma, el webhook nunca debe aceptar el estado "status": "pagado" de manera directa del cliente. El bot enviará "pendiente", y este cambiará a "pagado" una vez que la pasarela de pagos (PayPal, PayPhone, Stripe, etc.) notifique la confirmación de la transacción.

4. Campos inferidos del VCF mediante Lógica/IA
Para garantizar una experiencia fluida y evitar pedirle al usuario datos técnicos o de formato interno, el chatbot no debe solicitar los siguientes campos, ya que el sistema de ActivaQR o la IA de apoyo los deduce automáticamente:

FN (Full Name): El backend concatena dinámicamente este campo según el tipo_perfil:
Si es negocio: [nombre_negocio] - [contacto_nombre] [contacto_apellido].
Si es persona: [nombres] [apellidos].
N (Structured Name): El sistema divide y formatea los apellidos y nombres con punto y coma (Apellidos;Nombres;;;) para asegurar que el celular del cliente organice correctamente los contactos alfabéticamente.
NOTE (Notas Consolidadas): El backend estructura y escribe este campo de texto largo uniendo la bio del usuario, la lista ordenada de productos_servicios, la firma obligatoria de la plataforma (\n\n- Realizado por www.activaqr.com) e inserta las etiquetas SEO al final.
REV (Revision): Se genera automáticamente un código de tiempo ISO UTC (YYYYMMDDTHHMMSSZ) en cada generación del archivo, indicando al sistema operativo móvil si hay cambios y forzando la actualización en la agenda.
wa.me Links & X-SOCIALPROFILE: Los enlaces especiales para abrir chats directamente y los mapeos específicos para el sistema de contactos de iOS (como el tag X-ABLabel) se inyectan a partir de la limpieza y formateo del número de WhatsApp y las redes sociales proporcionadas.
etiquetas (Categorías): En caso de que el cliente no indique qué etiquetas usar, la IA de ActivaQR analiza la bio y los productos_servicios para deducir las palabras clave (como "médico, pediatra, consulta infantil") y guardarlas en el campo etiquetas (que se mapea a CATEGORIES en el VCF) para mejorar las búsquedas dentro de la agenda del teléfono.
20:37



Chvevere dame el webhook porfavor, que enviara porfavor, y si no hay generalo este webhook generara el producto de 35$ como en /registro okey?
20:42


I am running a TypeScript validation to verify that the new endpoint compiles cleanly and there are no syntax or type compatibility errors. I will let you know once it completes.

Run tsc check finished
¡He creado el webhook exclusivo para tu chatbot! Se ha compilado correctamente y está listo para integrarse.

El endpoint es seguro y permite registrar o actualizar usuarios del plan de $35 (Contacto Digital Esencial) marcándolos directamente como pagado (lo cual normalmente está bloqueado en el formulario público por razones de seguridad).

🌐 Detalle Técnico del Webhook
Ruta del Webhook: POST /api/webhook/chatbot-register
Cabecera de Autenticación Obligatoria:
x-admin-key: Debe contener el valor de tu variable de entorno ADMIN_API_KEY (configurada en tu archivo .env).
Content-Type: application/json
📥 Estructura del JSON a enviar (Payload)
Dependiendo de si el cliente es una Persona o un Negocio, debes enviar el siguiente JSON (envía solo una de las dos estructuras de nombres):

Caso A: Si es Perfil Personal (tipo_perfil: "persona")
json


{
  "email": "juan.perez@email.com",
  "whatsapp": "+593998765432",
  "tipo_perfil": "persona",
  "nombres": "Juan Carlos",
  "apellidos": "Pérez Maldonado",
  "profesion": "Consultor Financiero",
  "empresa": "Broker Capital",
  "bio": "Ayudo a profesionales y empresas a estructurar patrimonios eficientes y seguros.",
  "productos_servicios": "- Auditoría patrimonial\n- Estructuración de portafolios\n- Planificación de jubilación",
  "direccion": "Av. República del Salvador, Edificio Torre Alianza, Quito",
  "web": "https://www.juanperezconsultor.com",
  "instagram": "https://instagram.com/juanperez_finanzas",
  "facebook": "https://facebook.com/juanperezconsultor",
  "linkedin": "https://linkedin.com/in/juanperezconsultor",
  "foto_url": "https://tu-storage.com/fotos/juan_perez.jpg",
  "etiquetas": "finanzas, inversiones, consultoría, planificación fiscal",
  "status": "pagado"
}
Caso B: Si es Perfil de Negocio/Empresa (tipo_perfil: "negocio")
json


{
  "email": "contacto@panaderiasanta.com",
  "whatsapp": "+593998765432",
  "tipo_perfil": "negocio",
  "nombre_negocio": "Panadería Santa Petrona",
  "contacto_nombre": "María",
  "contacto_apellido": "Lozano",
  "profesion": "Panadería Artesanal",
  "bio": "Pan de masa madre, repostería fina tradicional y cafetería de especialidad en Loja.",
  "productos_servicios": "- Pan de Masa Madre tradicional\n- Croissants de almendras\n- Café de origen filtrado",
  "direccion": "Calle Bolívar y 10 de Agosto, Loja, Ecuador",
  "web": "https://www.santapetrona.com",
  "instagram": "https://instagram.com/santapetrona",
  "foto_url": "https://tu-storage.com/logos/santa_petrona_logo.png",
  "etiquetas": "panadería, masa madre, cafetería, repostería, loja",
  "status": "pagado"
}
📤 Respuesta del Webhook (Response JSON)
Si la transacción es exitosa, el webhook responderá con un código HTTP 200 y el siguiente JSON:

json


{
  "success": true,
  "action": "created", 
  "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "slug": "juan-carlos-perez-maldonado-8ag4",
  "edit_code": "RYA-2026-BOT-K9X2B1",
  "status": "pagado",
  "vcf_url": "https://tu-dominio.com/api/vcard/juan-carlos-perez-maldonado-8ag4",
  "card_url": "https://tu-dominio.com/card/juan-carlos-perez-maldonado-8ag4"
}
action: Devolverá "created" si es un nuevo registro, o "updated" si el correo electrónico ya existía en la base de datos (permitiendo actualizar sus campos).
vcf_url: La dirección URL directa desde la cual el cliente (o tu bot) puede descargar el archivo .vcf generado en tiempo real.
card_url: El enlace público del perfil digital asociado al contacto QR.
edit_code: Código de edición autogenerado por el sistema en caso de que el cliente desee ingresar más adelante a modificar sus datos manualmente.
⚙️ Lógica de Automatización Detrás de Escena
Inserción o Actualización Segura: Si el email ya existe, el bot actualizará la información sin solicitar el edit_code (puesto que el webhook ya está autenticado con tu cabecera x-admin-key).
Generación Automática de Slug: Si no provees un slug en el JSON, el endpoint lo genera dinámicamente sanitizando el nombre y agregando un sufijo único de 4 caracteres aleatorios.
Procesamiento de Pago Directo: Al registrarse como status: "pagado", el motor de correos de ActivaQR (procesado mediante su Cron Job programado /api/admin/cron/process-delayed-emails) detectará el registro en su próxima ejecución, enviando de inmediato el correo de bienvenida al cliente con su código QR e instrucciones de uso.
20:42



mi dominio es activaqr.com asi que dame el link completo porfavor
20:45


Aquí tienes los enlaces completos configurados con tu dominio activaqr.com:

1. Enlace del Webhook (Para configurar en tu chatbot/Make/Zapier)
URL: https://activaqr.com/api/webhook/chatbot-register
Método: POST
Header Obligatorio: x-admin-key: TU_ADMIN_API_KEY
2. Estructura de Enlaces que el Webhook te devolverá en su respuesta:
Enlace para Descargar el VCF (Directo): https://activaqr.com/api/vcard/nombre-del-cliente
Enlace de la Tarjeta Digital / Perfil QR (Pestaña Web): https://activaqr.com/card/nombre-del-cliente