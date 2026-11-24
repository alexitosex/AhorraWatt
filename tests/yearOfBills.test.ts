import { describe, expect, test } from "bun:test";

import {
  sortNewestFirst,
  validateBillDraft,
  type ElectricityBill,
} from "../src/features/receipts/bill";
import {
  emissionsKg,
  summarizeBills,
} from "../src/features/receipts/billStats";
import { formatMonth, formatPeriod } from "../src/lib/dates";
import { yearOfBills } from "./fixtures/yearOfBills";

const today = "2026-11-22";

function registerYear() {
  let bills: ElectricityBill[] = [];
  yearOfBills.forEach((entry, index) => {
    const { input, errors } = validateBillDraft(
      {
        periodStart: entry.start,
        periodEnd: entry.end,
        consumptionKwh: entry.kwh,
        amount: entry.amount,
      },
      bills,
      today,
    );
    expect(errors).toEqual({});
    if (!input) {
      throw new Error(`Bill ${index + 1} was rejected.`);
    }
    bills = sortNewestFirst([
      ...bills,
      { ...input, id: String(index), createdAt: "", updatedAt: "" },
    ]);
  });
  return bills;
}

describe("a user who registers twelve monthly bills", () => {
  const bills = registerYear();

  test("accepts every month in order and keeps the newest first", () => {
    expect(bills).toHaveLength(12);
    expect(bills[0].periodEnd).toBe("2026-11-11");
    expect(bills[11].periodStart).toBe("2025-11-11");
    expect(bills[5].amountCents).toBe(103_680);
  });

  test("rejects registering a month that is already there", () => {
    const { errors } = validateBillDraft(
      {
        periodStart: "11/06/2026",
        periodEnd: "11/07/2026",
        consumptionKwh: "410",
        amount: "1118.30",
      },
      bills,
      today,
    );
    expect(errors.periodStart).toBeDefined();
  });

  test("compares the latest month with the previous one", () => {
    const summary = summarizeBills(bills);
    expect(summary?.latest.consumptionKwh).toBe(215);
    expect(summary?.consumptionChange).toBeCloseTo(((215 - 240) / 240) * 100);
    expect(summary?.dailyAverage).toBeCloseTo(215 / 31);
    expect(summary?.emissionsChangeKg).toBeCloseTo(emissionsKg(215 - 240));
    expect(summary?.periodsDiffer).toBe(false);
  });

  test("the chart shows the last six periods in chronological order", () => {
    const chart = bills
      .slice(0, 6)
      .reverse()
      .map((bill) => formatMonth(bill.periodEnd));
    expect(chart).toEqual(["Jun", "Jul", "Ago", "Sep", "Oct", "Nov"]);
    expect(formatPeriod(bills[11].periodStart, bills[11].periodEnd)).toBe(
      "11 nov – 11 dic",
    );
  });

  test("the yearly totals add up", () => {
    const totalKwh = bills.reduce((sum, bill) => sum + bill.consumptionKwh, 0);
    const totalCents = bills.reduce((sum, bill) => sum + bill.amountCents, 0);
    expect(totalKwh).toBe(3398);
    expect(totalCents).toBe(785_190);
  });
});
