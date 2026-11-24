import { describe, expect, test } from "bun:test";

import {
  isElectricityBill,
  validateBillDraft,
  type ElectricityBill,
} from "../src/features/receipts/bill";

const today = "2026-11-21";
const existing: ElectricityBill = {
  id: "a",
  amountCents: 85_600,
  consumptionKwh: 420,
  periodStart: "2026-09-12",
  periodEnd: "2026-11-11",
  createdAt: "2026-11-12T00:00:00.000Z",
  updatedAt: "2026-11-12T00:00:00.000Z",
};
const validDraft = {
  periodStart: "11/07/2026",
  periodEnd: "11/09/2026",
  consumptionKwh: "512",
  amount: "$1,064.50",
};

describe("validateBillDraft", () => {
  test("accepts a valid bill and stores money as integer centavos", () => {
    const result = validateBillDraft(validDraft, [existing], today);
    expect(result.errors).toEqual({});
    expect(result.input).toEqual({
      periodStart: "2026-07-11",
      periodEnd: "2026-09-11",
      consumptionKwh: 512,
      amountCents: 106_450,
    });
  });

  test("rejects negative, zero and non-numeric values", () => {
    for (const value of ["-5", "0", "abc", ""]) {
      const { errors } = validateBillDraft(
        { ...validDraft, consumptionKwh: value, amount: value },
        [],
        today,
      );
      expect(errors.consumptionKwh).toBeDefined();
      expect(errors.amount).toBeDefined();
    }
  });

  test("rejects impossible dates", () => {
    const { errors } = validateBillDraft(
      { ...validDraft, periodStart: "31/02/2026" },
      [],
      today,
    );
    expect(errors.periodStart).toBeDefined();
  });

  test("rejects an end date before the start", () => {
    const { errors } = validateBillDraft(
      { ...validDraft, periodStart: "11/09/2026", periodEnd: "11/07/2026" },
      [],
      today,
    );
    expect(errors.periodEnd).toBeDefined();
  });

  test("rejects future end dates and periods longer than 100 days", () => {
    expect(
      validateBillDraft({ ...validDraft, periodEnd: "01/12/2026" }, [], today)
        .errors.periodEnd,
    ).toBeDefined();
    expect(
      validateBillDraft({ ...validDraft, periodStart: "01/01/2026" }, [], today)
        .errors.periodEnd,
    ).toBeDefined();
  });

  test("rejects periods that overlap a registered bill but allows touching ones", () => {
    const overlapping = validateBillDraft(
      { ...validDraft, periodStart: "01/10/2026", periodEnd: "20/11/2026" },
      [existing],
      today,
    );
    expect(overlapping.errors.periodStart).toBeDefined();

    const touching = validateBillDraft(
      { ...validDraft, periodStart: "11/11/2026", periodEnd: "20/11/2026" },
      [existing],
      today,
    );
    expect(touching.errors).toEqual({});
  });
});

describe("isElectricityBill", () => {
  test("accepts stored bills and rejects corrupted ones", () => {
    expect(isElectricityBill(existing)).toBe(true);
    expect(isElectricityBill({ ...existing, amountCents: 10.5 })).toBe(false);
    expect(isElectricityBill({ ...existing, periodEnd: "2026-01-01" })).toBe(
      false,
    );
    expect(isElectricityBill(null)).toBe(false);
  });
});
