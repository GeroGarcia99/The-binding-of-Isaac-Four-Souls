/**
 * Four Souls Online - Generador y Validador de Códigos de Sala
 * Genera códigos de 6 caracteres alfanuméricos legibles y sin ambigüedades.
 */

// Usamos caracteres alfanuméricos en mayúsculas excluyendo caracteres visualmente confusos (O, 0, I, 1)
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

/**
 * Genera un código aleatorio de sala de exactamente 6 caracteres
 */
export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * CODE_ALPHABET.length);
    code += CODE_ALPHABET[randomIndex];
  }
  return code;
}

/**
 * Normaliza y limpia una entrada de código (mayúsculas y sin espacios)
 */
export function normalizeRoomCode(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Valida si un código cumple con el formato requerido de 6 caracteres
 */
export function isValidRoomCode(code: string): boolean {
  const normalized = normalizeRoomCode(code);
  return normalized.length === CODE_LENGTH;
}
