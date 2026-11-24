import { sha256 } from "../../lib/sha256";

export type Account = {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
};

export type CredentialErrors = Partial<
  Record<"email" | "password" | "confirmPassword" | "form", string>
>;

export const minPasswordLength = 8;
// Repeated hashing slows down guessing attacks on a copied device database.
const hashRounds = 1000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string, salt: string) {
  let hash = sha256(`${salt}:${password}`);
  for (let round = 1; round < hashRounds; round++) {
    hash = sha256(`${salt}:${hash}`);
  }
  return hash;
}

export function createSalt() {
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    bytes.forEach((_, index) => {
      bytes[index] = Math.floor(Math.random() * 256);
    });
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function validateSignUp(
  email: string,
  password: string,
  confirmPassword: string,
  accounts: Account[],
) {
  const errors: CredentialErrors = {};
  const normalized = normalizeEmail(email);
  if (!emailPattern.test(normalized)) {
    errors.email = "Escribe un correo válido.";
  } else if (accounts.some((account) => account.email === normalized)) {
    errors.email = "Ya existe una cuenta con este correo.";
  }
  if (password.length < minPasswordLength) {
    errors.password = `Usa al menos ${minPasswordLength} caracteres.`;
  }
  if (confirmPassword !== password) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }
  return errors;
}

export function findAccount(
  email: string,
  password: string,
  accounts: Account[],
) {
  const account = accounts.find(
    (candidate) => candidate.email === normalizeEmail(email),
  );
  if (
    !account ||
    hashPassword(password, account.salt) !== account.passwordHash
  ) {
    return null;
  }
  return account;
}

export function isAccount(value: unknown): value is Account {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const account = value as Record<string, unknown>;
  return (
    typeof account.id === "string" &&
    typeof account.email === "string" &&
    typeof account.passwordHash === "string" &&
    typeof account.salt === "string" &&
    typeof account.createdAt === "string"
  );
}
