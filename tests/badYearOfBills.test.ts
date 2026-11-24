import { describe, expect, test } from "bun:test";

import {
  sortNewestFirst,
  validateBillDraft,
  type ElectricityBill,
} from "../src/features/receipts/bill";
import {
  dailyAverageKwh,
  emissionsKg,
  summarizeBills,
} from "../src/features/receipts/billStats";
import { badYearOfBills } from "./fixtures/yearOfBills";

function registerYear() {
  let bills: ElectricityBill[] = [];
  badYearOfBills.forEach((entry, index) => {
    const { input, errors } = validateBillDraft(
      {
        periodStart: entry.start,
        periodEnd: entry.end,
        consumptionKwh: entry.kwh,
        amount: entry.amount,
      },
      bills,
      "2026-11-22",
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

describe("a user whose consumption gets worse over the year", () => {
  const bills = registerYear();
  const summary = summarizeBills(bills);

  test("reports an increase against the previous month", () => {
    expect(summary?.consumptionChange).toBeCloseTo(((520 - 480) / 480) * 100);
    expect(summary?.consumptionChange).toBeGreaterThan(0);
  });

  test("the daily average also goes up even though November is longer", () => {
    expect(summary?.dailyAverageChange).toBeGreaterThan(0);
    expect(summary?.dailyAverage).toBeCloseTo(520 / 31);
  });

  test("reports more emissions than the previous month", () => {
    expect(summary?.emissionsChangeKg).toBeCloseTo(emissionsKg(40));
    expect(summary?.emissionsChangeKg).toBeGreaterThan(0);
  });

  test("the last month uses double the energy per day of the first", () => {
    const first = bills[bills.length - 1];
    expect(dailyAverageKwh(bills[0]) / dailyAverageKwh(first)).toBeGreaterThan(
      1.9,
    );
  });

  test("the yearly totals add up", () => {
    expect(bills.reduce((sum, bill) => sum + bill.consumptionKwh, 0)).toBe(
      4985,
    );
    expect(bills.reduce((sum, bill) => sum + bill.amountCents, 0)).toBe(
      1_497_700,
    );
  });
});
