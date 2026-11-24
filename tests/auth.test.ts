import { describe, expect, test } from "bun:test";

import {
  findAccount,
  hashPassword,
  validateSignUp,
  type Account,
} from "../src/features/auth/credentials";
import { sha256 } from "../src/lib/sha256";

describe("sha256", () => {
  test("matches the official test vectors", () => {
    expect(sha256("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
    expect(sha256("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(
      sha256("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"),
    ).toBe("248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1");
    expect(sha256("ñ⚡")).toBe(
      new Bun.CryptoHasher("sha256").update("ñ⚡").digest("hex"),
    );
  });
});

const account: Account = {
  id: "1",
  email: "ana@example.com",
  salt: "salt",
  passwordHash: hashPassword("correcta123", "salt"),
  createdAt: "",
};

describe("credentials", () => {
  test("finds an account only with the right password", () => {
    expect(findAccount(" Ana@Example.com ", "correcta123", [account])).toBe(
      account,
    );
    expect(findAccount("ana@example.com", "incorrecta", [account])).toBeNull();
    expect(
      findAccount("otra@example.com", "correcta123", [account]),
    ).toBeNull();
  });

  test("validates sign up data", () => {
    expect(
      validateSignUp("nuevo@example.com", "12345678", "12345678", []),
    ).toEqual({});
    const errors = validateSignUp("ana@example.com", "corta", "otra", [
      account,
    ]);
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
    expect(errors.confirmPassword).toBeDefined();
    expect(
      validateSignUp("sin-arroba", "12345678", "12345678", []).email,
    ).toBeDefined();
  });
});
