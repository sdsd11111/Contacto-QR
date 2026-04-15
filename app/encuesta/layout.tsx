import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Calcula tu Impacto de Visibilidad - ActivaQR",
    description: "Realiza nuestro test de visibilidad y descubre cuántas oportunidades de negocio estás perdiendo hoy por no tener un contacto digital profesional.",
};

export default function EncuestaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
