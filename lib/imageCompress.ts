/**
 * lib/imageCompress.ts
 * Comprime imágenes en el cliente ANTES de subirlas para evitar error 413 (Payload Too Large).
 * El servidor ya redimensiona a 1200px con Sharp, así que hacemos lo mismo del lado cliente.
 */

const MAX_DIMENSION = 1200;
const QUALITY = 0.8; // 80% calidad WebP
const MAX_SIZE_BYTES = 800 * 1024; // 800KB target

/**
 * Comprime una imagen en el cliente usando Canvas.
 * Retorna un File comprimido (WebP) listo para subir.
 */
export async function compressImage(file: File): Promise<File> {
    // Solo comprimir imágenes
    if (!file.type.startsWith('image/')) {
        return file;
    }

    // Si ya es pequeña, subir sin comprimir
    if (file.size < MAX_SIZE_BYTES) {
        return file;
    }

    try {
        const compressedBlob = await compressImageToBlob(file);
        
        // Si la compresión no redujo el tamaño, retornar original
        if (compressedBlob.size >= file.size) {
            return file;
        }

        // Crear nuevo File con el mismo nombre pero comprimido
        const newName = file.name.replace(/\.[^.]+$/, '.webp');
        return new File([compressedBlob], newName, { type: 'image/webp' });
    } catch (err) {
        console.warn('[compressImage] Error comprimiendo, usando original:', err);
        return file;
    }
}

/**
 * Comprime imagen a WebP usando Canvas
 */
function compressImageToBlob(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            // Calcular nuevas dimensiones manteniendo aspecto
            let { width, height } = img;
            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            // Crear canvas y dibujar imagen redimensionada
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('No se pudo crear contexto 2D'));
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);

            // Exportar como WebP
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas toBlob devolvió null'));
                    }
                },
                'image/webp',
                QUALITY
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Error cargando imagen para compresión'));
        };

        img.src = url;
    });
}
