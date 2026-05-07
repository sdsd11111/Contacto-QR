import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Demo de Plantilla | ActivaQR",
    description: "Vista previa de plantilla de landing page ActivaQR.",
    robots: { index: false, follow: false },
};

/**
 * Layout para /demo/*
 * Suprime el Navbar y Footer globales para que las demos
 * se vean como landing pages independientes.
 */
export default function DemoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
