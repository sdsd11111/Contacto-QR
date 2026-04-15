import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Diagnóstico de Visibilidad Digital - ActivaQR",
    description: "¿Tu comida es increíble pero tu presencia digital es un desastre? Descubre por qué pierdes reservas con nuestro test gratuito para restaurantes.",
};

export default function DiagnosticoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
