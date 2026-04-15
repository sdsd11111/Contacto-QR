const fs = require('fs');
const file = 'd:/Abel paginas/Generador QR contacto/Generador de vcard y codigos QR/vcard-app/components/vendedor/DirectVCardRegistration.tsx';
let content = fs.readFileSync(file, 'utf8');

// The block to remove starts around line 1353 and ends around 1389
const removeStart = "{formData.plan !== 'digital' && (\\n                                    <div className=\\\"bg-[#050B1C] border border-white/10 p-8 rounded-[32px] space-y-6\\\">";
const removeStartR = "{formData.plan !== 'digital' && (\\r\\n                                    <div className=\\\"bg-[#050B1C] border border-white/10 p-8 rounded-[32px] space-y-6\\\">";

const removeEnd = "                                        </div>\\n                                    </div>\\n                                )}";
const removeEndR = "                                        </div>\\r\\n                                    </div>\\r\\n                                )}";

let startIndex = content.indexOf(removeStart);
let endIndex = content.indexOf(removeEnd);

if (startIndex === -1 || endIndex === -1) {
    startIndex = content.indexOf(removeStartR);
    endIndex = content.indexOf(removeEndR);
    if (startIndex === -1 || endIndex === -1) {
        console.error("COULD NOT FIND BLOCK TO REMOVE");
        process.exit(1);
    } else {
        endIndex += removeEndR.length;
    }
} else {
    endIndex += removeEnd.length;
}

// remove it
content = content.slice(0, startIndex) + content.slice(endIndex);

// insert google maps in step 3 after "Ciudad y Dirección *" (which is around line 964)
const mapsSnippet = `                                <div className="space-y-2 pt-4">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-primary">Link de Google Maps</label>
                                    <input type="url" value={formData.google_business}
                                        onChange={(e) => updateForm('google_business', e.target.value)}
                                        onFocus={() => setFocusedField('google_business')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-primary/50 text-white outline-none"
                                        placeholder="https://maps.app.goo.gl/..." />
                                </div>`;

const targetInsert = `                                        className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-primary/50 text-white outline-none"\\n                                        placeholder="Ej: Loja, Av. Cuxibamba 12-34" />\\n                                </div>`;
const targetInsertR = `                                        className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-primary/50 text-white outline-none"\\r\\n                                        placeholder="Ej: Loja, Av. Cuxibamba 12-34" />\\r\\n                                </div>`;

if (content.indexOf(targetInsert) !== -1) {
    content = content.replace(targetInsert, targetInsert + "\\n\\n" + mapsSnippet);
} else if (content.indexOf(targetInsertR) !== -1) {
    content = content.replace(targetInsertR, targetInsertR + "\\r\\n\\r\\n" + mapsSnippet);
} else {
    console.error("COULD NOT FIND MAPS INSERT TARGET");
    process.exit(1);
}

fs.writeFileSync(file, content);
console.log("Done");
