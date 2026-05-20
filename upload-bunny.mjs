import fs from 'fs';
import path from 'path';

const ZONE = 'activaqr-archivos';
const API_KEY = process.env.BUNNY_API_KEY;
if (!API_KEY) {
  console.error('❌ BUNNY_API_KEY no está configurada en las variables de entorno');
  process.exit(1);
}
const HOST = 'storage.bunnycdn.com';

const digitalDir = path.join(process.cwd(), 'public', 'images', 'contacto-digital');
const businessDir = path.join(process.cwd(), 'public', 'images', 'contacto-bussines');
const catalogoDir = path.join(process.cwd(), 'public', 'images', 'contacto-bussines-catalogo');
const sitioWebDir = path.join(process.cwd(), 'public', 'images', 'sitio web');

async function uploadFile(filePath, relativePath, prefix) {
    // Replace backslashes with forward slashes for URLs
    let storagePath = relativePath.replace(/\\/g, '/');
    // We want the path in bunny to be like: /prefix/Subfolder/...
    storagePath = `${prefix}/${storagePath}`;
    
    // We must URL encode the path segments (e.g. "Tu Contacto" -> "Tu%20Contacto")
    storagePath = storagePath.split('/').map(segment => encodeURIComponent(segment)).join('/');

    const url = `https://${HOST}/${ZONE}/${storagePath}`;
    
    console.log(`Uploading ${filePath} to \n${url}...`);
    
    const fileStream = fs.createReadStream(filePath);
    
    // Web fetch API supports streams
    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'AccessKey': API_KEY,
                'Content-Type': 'application/octet-stream' // generic binary
            },
            body: fileStream,
            duplex: 'half'
        });
        
        if (res.ok) {
            console.log(`Success: ${storagePath}`);
            return `https://activaqr-archivos.b-cdn.net/${storagePath}`;
        } else {
            const err = await res.text();
            console.error(`Failed: ${res.status} ${err}`);
        }
    } catch (err) {
        console.error(`Error uploading ${storagePath}:`, err);
    }
    return null;
}

async function scanAndUpload(dir, base, prefix) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (let entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await scanAndUpload(fullPath, base, prefix);
        } else if (entry.isFile() && (entry.name.endsWith('.png') || entry.name.endsWith('.jpg') || entry.name.endsWith('.webp'))) {
            const relPath = path.relative(base, fullPath);
            const publicUrl = await uploadFile(fullPath, relPath, prefix);
            console.log(`Public URL: ${publicUrl}\n`);
        }
    }
}

async function run() {
    console.log(`Starting upload from digital and business directories...`);
    if (fs.existsSync(digitalDir)) {
        console.log(`Scanning Digital: ${digitalDir}`);
        await scanAndUpload(digitalDir, digitalDir, 'contacto-digital');
    }
    if (fs.existsSync(businessDir)) {
        console.log(`Scanning Business: ${businessDir}`);
        await scanAndUpload(businessDir, businessDir, 'contacto-bussines');
    }
    if (fs.existsSync(catalogoDir)) {
        console.log(`Scanning Catalogo: ${catalogoDir}`);
        await scanAndUpload(catalogoDir, catalogoDir, 'contacto-bussines-catalogo');
    }
    if (fs.existsSync(sitioWebDir)) {
        console.log(`Scanning Sitio Web: ${sitioWebDir}`);
        await scanAndUpload(sitioWebDir, sitioWebDir, 'sitio-web-completo');
    }
    console.log("Done.");
}

run();
