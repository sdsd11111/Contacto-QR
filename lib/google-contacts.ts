import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN
});

const people = google.people({ version: 'v1', auth: oauth2Client });

/**
 * Guarda un contacto en Google Contacts
 * @param name Nombre del contacto
 * @param phone Teléfono (formato internacional)
 * @returns boolean Éxito o fracaso
 */
export async function saveToGoogleContacts(name: string, phone: string) {
    try {
        if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
            console.error('❌ Google Contacts credentials missing');
            return false;
        }

        const response = await people.people.createContact({
            requestBody: {
                names: [
                    {
                        givenName: `Nuevo Lead: ${name}`,
                    },
                ],
                phoneNumbers: [
                    {
                        value: phone,
                        type: 'mobile',
                    },
                ],
                biographies: [
                    {
                        value: `Registrado automáticamente por el bot de ActivaQR el ${new Date().toLocaleString()}`,
                        contentType: 'TEXT_PLAIN',
                    }
                ],
            },
        });

        console.log(`✅ Contacto guardado en Google: ${name} (${phone}) - ID: ${response.data.resourceName}`);
        return true;
    } catch (error: any) {
        console.error('❌ Error saving to Google Contacts:', error?.response?.data || error);
        return false;
    }
}
