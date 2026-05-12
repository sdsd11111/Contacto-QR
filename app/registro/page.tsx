import type { Metadata } from "next";
import { Suspense } from "react";
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
                    <div className="text-2xl font-black tracking-tighter text-white flex items-center justify-center gap-2 mb-8">
                        ActivaQR
                    </div>
                </div>

                <Suspense fallback={<div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
                    <RegisterWizard />
                </Suspense>
            </div>
        </main>
    );
}
