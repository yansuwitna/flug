import { describe, it, expect } from "vitest";
import { normalizeFlag, hashFlag, hashPassword, verifyPassword } from "@/lib/security/hash";
import { getLevelFromXp, TINGKAT_INVESTIGATOR } from "@/features/gamification/levels";

describe("Security & Flag Validation Engine", () => {
  it("harus menormalkan flag case-insensitive dengan benar", () => {
    const raw = "  FLAG{InVeStIgAsI_123}  ";
    const normalized = normalizeFlag(raw, { trimSpaces: true, isCaseSensitive: false });
    expect(normalized).toBe("flag{investigasi_123}");
  });

  it("harus mempertahankan huruf kapital jika case-sensitive = true", () => {
    const raw = "  FLAG{RaHaSiA}  ";
    const normalized = normalizeFlag(raw, { trimSpaces: true, isCaseSensitive: true });
    expect(normalized).toBe("FLAG{RaHaSiA}");
  });

  it("harus menghasilkan HMAC hash yang konsisten untuk flag yang identik", () => {
    const flag1 = normalizeFlag("FLAG{network_forensics}", { trimSpaces: true, isCaseSensitive: false });
    const flag2 = normalizeFlag("  flag{network_forensics} ", { trimSpaces: true, isCaseSensitive: false });

    const hash1 = hashFlag(flag1);
    const hash2 = hashFlag(flag2);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex string length
  });

  it("harus menghasilkan hash yang berbeda untuk flag yang tidak cocok", () => {
    const hashA = hashFlag("flag{benar}");
    const hashB = hashFlag("flag{salah}");
    expect(hashA).not.toBe(hashB);
  });

  it("harus berhasil melakukan hash dan verifikasi password bcrypt", async () => {
    const password = "RahasiaSiswa123!";
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(password, hash);
    const isInvalid = await verifyPassword("SalahPassword", hash);

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });
});

describe("Gamification Level Progression", () => {
  it("harus mengembalikan Level 1 untuk 0 XP", () => {
    const lvl = getLevelFromXp(0);
    expect(lvl.level).toBe(1);
    expect(lvl.gelar).toBe("Penyelidik Pemula");
  });

  it("harus mengembalikan Level 2 untuk 250 XP", () => {
    const lvl = getLevelFromXp(250);
    expect(lvl.level).toBe(2);
    expect(lvl.gelar).toBe("Pandu Junior");
  });

  it("harus mengembalikan Level 3 untuk 750 XP", () => {
    const lvl = getLevelFromXp(750);
    expect(lvl.level).toBe(3);
    expect(lvl.gelar).toBe("Detektif Siber");
  });

  it("harus mengembalikan Level 5 untuk 2500 XP", () => {
    const lvl = getLevelFromXp(2500);
    expect(lvl.level).toBe(5);
    expect(lvl.gelar).toBe("Master Hunter Elit");
  });
});
