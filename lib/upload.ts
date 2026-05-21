/**
 * lib/upload.ts
 * Helper universal para subir imágenes con compresión automática.
 * Reemplaza todos los fetch('/api/upload', ...) directos.
 */
import { compressImage } from './imageCompress';

interface UploadOptions {
    file: File;
    slug?: string;
}

interface UploadResult {
    url: string;
}

/**
 * Sube un archivo comprimiéndolo automáticamente si es imagen > 800KB.
 */
export async function uploadFile({ file, slug }: UploadOptions): Promise<UploadResult> {
    // Comprimir si es imagen
    const fileToUpload = file.type.startsWith('image/') ? await compressImage(file) : file;

    const fd = new FormData();
    fd.append('file', fileToUpload);
    if (slug) fd.append('slug', slug);

    const res = await fetch('/api/upload', { method: 'POST', body: fd });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error al subir (${res.status}): ${text}`);
    }

    return res.json();
}
