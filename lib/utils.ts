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
    if (clean.startsWith('09') && clean.length === 10) {
        return `+593 ${clean.substring(1)}`;
    }
    // Si ya tiene el 593 pero sin el + y con el 0 adicional (error común: 59309...)
    if (clean.startsWith('59309') && clean.length === 13) {
        return `+593 ${clean.substring(4)}`;
    }
    // Si tiene 5939... pero falta el +
    if (clean.startsWith('5939') && clean.length === 12) {
        return `+593 ${clean.substring(3)}`;
    }
    // Si ya tiene el formato correcto +593 9..., no tocar o asegurar espacio
    if (phone.startsWith('+593')) {
        return phone.includes(' ') ? phone : `+593 ${phone.substring(4).trim()}`;
    }

    return phone;
}
