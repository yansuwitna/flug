import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Normalisasi flag jawaban sesuai konfigurasi challenge.
 * Menghilangkan whitespace di awal & akhir jika trimSpaces = true.
 * Mengubah ke lowercase jika case-insensitive.
 */
export function normalizeFlag(
  input: string,
  options: { trimSpaces?: boolean; isCaseSensitive?: boolean } = {}
): string {
  let normalized = input;
  if (options.trimSpaces !== false) {
    normalized = normalized.trim();
  }
  if (!options.isCaseSensitive) {
    normalized = normalized.toLowerCase();
  }
  return normalized;
}

/**
 * Menghitung HMAC-SHA256 untuk memverifikasi kecocokan flag secara aman
 * tanpa mengekspos raw answer ke client atau menyimpannya dalam plaintext.
 */
export function hashFlag(normalizedAnswer: string): string {
  const secret = process.env.AUTH_SECRET || "flag_hunter_fallback_secret_salt";
  return crypto.createHmac("sha256", secret).update(normalizedAnswer).digest("hex");
}
