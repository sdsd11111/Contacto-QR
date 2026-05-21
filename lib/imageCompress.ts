/**
 * lib/imageCompress.ts
 * Comprime imágenes en el cliente ANTES de subirlas para evitar error 413 (Payload Too Large).
 * El servidor ya redimensiona a 1200px con Sharp, así que hacemos lo mismo del lado cliente.
 *
 * - Intenta WebP primero (Chrome, Firefox, Edge, Safari 14+)
 * - Fallback a JPEG si WebP no es soportado (Safari <14)
 * - Si el resultado sigue siendo muy grande (>3MB), reintenta con menor calidad
 * - Si todo falla, retorna el original
 */

const MAX_DIMENSION = 1000;
const QUALITY = 0.7;
const MAX_SIZE_BYTES = 500 * 1024; // Solo comprimir si > 500KB

export async function compressImage(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) return file;
    if (file.size < MAX_SIZE_BYTES) return file;

    let quality = QUALITY;
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const result = await compressImageToBlob(file, quality);
            if (result.blob.size < file.size && result.blob.size < 3 * 1024 * 1024) {
                const newName = file.name.replace(/\.[^.]+$/, `.${result.ext}`);
                return new File([result.blob], newName, { type: result.mimeType });
            }
            quality = 0.4; // Segunda pasada con calidad más baja
        } catch (err) {
            console.warn(`[compressImage] Intento ${attempt + 1} falló:`, err);
            quality = 0.4;
        }
    }

    console.warn('[compressImage] No se pudo comprimir lo suficiente, usando original');
    return file;
}

function compressImageToBlob(file: File, quality: number): Promise<{ blob: Blob; mimeType: string; ext: string }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            let { width, height } = img;
            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('No se pudo crear contexto 2D')); return; }
            ctx.drawImage(img, 0, 0, width, height);

            // Intentar WebP, fallback a JPEG
            tryFormat('image/webp', 'webp');

            function tryFormat(fmt: 'image/webp' | 'image/jpeg', ext: string) {
                canvas.toBlob((blob) => {
                    if (blob) resolve({ blob, mimeType: fmt, ext });
                    else if (fmt === 'image/webp') tryFormat('image/jpeg', 'jpg'); // fallback
                    else reject(new Error(`Canvas toBlob devolvió null`));
                }, fmt, quality);
            }
        };

        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Error cargando imagen')); };
        img.src = url;
    });
}
