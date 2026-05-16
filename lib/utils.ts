import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPhoneEcuador(phone: string): string {
    if (!phone) return phone;

    // Quitar todo lo que no sea número
    let clean = phone.replace(/\D/g, '');

    // Si empieza con 09 y tiene 10 dígitos (Ecuador móvil local)
    if (clean.startsWith('0') && clean.length === 10) {
        return `+593 ${clean.substring(1)}`;
    }
    // Si ya tiene el 593 y 12 dígitos total (ej: 593987654321)
    if (clean.startsWith('593') && clean.length === 12) {
        return `+593 ${clean.substring(3)}`;
    }
    // Si ya tiene el formato correcto +593 9..., asegurar espacio
    if (phone.startsWith('+593')) {
        let onlyDigits = phone.replace(/\D/g, '');
        if (onlyDigits.length === 12) return `+593 ${onlyDigits.substring(3)}`;
    }

    return phone;
}
