import { describe, it, expect } from "vitest";
import { normalizeFlag, hashFlag, hashPassword, verifyPassword } from "../src/lib/security/hash";
import { getLevelFromXp } from "../src/features/gamification/levels";

describe("Security & Flag Validation Engine", () => {
  it("harus menormalkan flag case-insensitive dengan benar", () => {
    const raw = "  FLAG{Test_Answer_123}  ";
    const normalized = normalizeFlag(raw, { trimSpaces: true, isCaseSensitive: false });
    expect(normalized).toBe("flag{test_answer_123}");
  });

  it("harus mempertahankan huruf kapital jika case-sensitive = true", () => {
    const raw = "  FLAG{CaseSensitiveKey}  ";
    const normalized = normalizeFlag(raw, { trimSpaces: true, isCaseSensitive: true });
    expect(normalized).toBe("FLAG{CaseSensitiveKey}");
  });

  it("harus menghasilkan HMAC hash yang konsisten untuk flag yang identik", () => {
    const flag1 = "flag{my_secret_token}";
    const flag2 = "flag{my_secret_token}";
    expect(hashFlag(flag1)).toBe(hashFlag(flag2));
  });

  it("harus menghasilkan hash yang berbeda untuk flag yang tidak cocok", () => {
    const flagCorrect = "flag{correct}";
    const flagWrong = "flag{wrong}";
    expect(hashFlag(flagCorrect)).not.toBe(hashFlag(flagWrong));
  });

  it("harus berhasil melakukan hash dan verifikasi password bcrypt", async () => {
    const password = "password123";
    const hashed = await hashPassword(password);
    expect(hashed).not.toBe(password);

    const isValid = await verifyPassword(password, hashed);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword("wrongpassword", hashed);
    expect(isInvalid).toBe(false);
  });
});

describe("Gamification Level Progression", () => {
  it("harus mengembalikan Level 1 untuk 0 XP", () => {
    const lvl = getLevelFromXp(0);
    expect(lvl.level).toBe(1);
    expect(lvl.title).toBe("Recruit Investigator");
  });

  it("harus mengembalikan Level 2 untuk 250 XP", () => {
    const lvl = getLevelFromXp(250);
    expect(lvl.level).toBe(2);
    expect(lvl.title).toBe("Junior Scout");
  });

  it("harus mengembalikan Level 3 untuk 750 XP", () => {
    const lvl = getLevelFromXp(750);
    expect(lvl.level).toBe(3);
    expect(lvl.title).toBe("Cyber Detective");
  });

  it("harus mengembalikan Level 5 untuk 2500 XP", () => {
    const lvl = getLevelFromXp(2500);
    expect(lvl.level).toBe(5);
    expect(lvl.title).toBe("Elite Master Hunter");
  });
});
