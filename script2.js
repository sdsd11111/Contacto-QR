const fs = require('fs');
const file = 'd:/Abel paginas/Generador QR contacto/Generador de vcard y codigos QR/vcard-app/components/admin/VCardEditModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// The class name that's missing text-white
// Examples:
// className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
// className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-bold outline-none focus:border-primary/40 transition-all"

const search1 = 'className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"';
const replace1 = 'className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-primary/40 transition-all"';

const search2 = 'className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-bold outline-none focus:border-primary/40 transition-all"';
const replace2 = 'className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-bold text-white outline-none focus:border-primary/40 transition-all"';

const search3 = 'className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/40 transition-all text-sm"';
const replace3 = 'className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/40 transition-all text-sm"';

// Also for textareas:
const search4 = 'className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/40 transition-all min-h-[120px] resize-y"';
const replace4 = 'className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-primary/40 transition-all min-h-[120px] resize-y"';

content = content.replaceAll(search1, replace1);
content = content.replaceAll(search2, replace2);
content = content.replaceAll(search3, replace3);
content = content.replaceAll(search4, replace4);

fs.writeFileSync(file, content);
console.log("Replaced text colors.");
