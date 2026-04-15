import type { Metadata } from "next";
import RegisterWizard from "@/components/RegisterWizard";

export const metadata: Metadata = {
    title: "Crea tu Contacto Digital - ActivaQR",
    description: "Configura tu tarjeta de contacto profesional con código QR en menos de 2 minutos. Asegura que tus clientes siempre te encuentren.",
};

export default function RegistroPage() {
    return (
        <main className="min-h-screen bg-cream py-24 px-6 flex flex-col items-center">
            <div className="max-w-7xl mx-auto w-full">
                <div className="mb-12 text-center">
                    <div className="text-2xl font-black tracking-tighter text-navy flex items-center justify-center gap-2 mb-8">
                        ActivaQR
                    </div>
                </div>

                <RegisterWizard />
            </div>
        </main>
    );
}
