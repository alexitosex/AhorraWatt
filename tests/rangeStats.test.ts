import { describe, expect, test } from "bun:test";

import {
  sortNewestFirst,
  validateBillDraft,
  type ElectricityBill,
} from "../src/features/receipts/bill";
import { summarizeRange } from "../src/features/statistics/rangeStats";
import { yearOfBills } from "./fixtures/yearOfBills";

function registerYear() {
  let bills: ElectricityBill[] = [];
  yearOfBills.forEach((entry, index) => {
    const { input } = validateBillDraft(
      {
        periodStart: entry.start,
        periodEnd: entry.end,
        consumptionKwh: entry.kwh,
        amount: entry.amount,
      },
      bills,
      "2026-11-22",
    );
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

describe("summarizeRange", () => {
  const bills = registerYear();

  test("returns null without bills", () => {
    expect(summarizeRange([], "6")).toBeNull();
  });

  test("compares the last six months with the six before, per day", () => {
    const summary = summarizeRange(bills, "6");
    expect(summary?.bills).toHaveLength(6);
    expect(summary?.totals.kwh).toBe(390 + 410 + 380 + 300 + 240 + 215);
    expect(summary?.comparison?.basis).toBe("previousRange");
    // May 11 – Nov 11 has 184 days; Nov 11 – May 11 has 181.
    expect(summary?.comparison?.consumptionChange).toBeCloseTo(
      ((1935 / 184 - 1463 / 181) / (1463 / 181)) * 100,
    );
    const previousCents = 41_250 + 39_820 + 38_190 + 45_510 + 61_840 + 84_270;
    const currentCents = 103_680 + 111_830 + 99_860 + 68_920 + 47_890 + 42_130;
    expect(summary?.comparison?.savingsCents).toBe(
      Math.round((previousCents / 181 - currentCents / 184) * 184),
    );
  });

  test("without an earlier range, compares the latest bill with the rest", () => {
    const summary = summarizeRange(bills, "12");
    expect(summary?.bills).toHaveLength(12);
    expect(summary?.comparison?.basis).toBe("earlierBills");
    const earlierKwh = 3398 - 215;
    const earlierDays = 365 - 31;
    expect(summary?.comparison?.consumptionChange).toBeCloseTo(
      ((215 / 31 - earlierKwh / earlierDays) / (earlierKwh / earlierDays)) *
        100,
    );
  });

  test("compares bimonthly bills against a range with fewer bills", () => {
    const bimonthly = sortNewestFirst(
      [
        ["2025-12-16", "2026-02-16", 600, 120_000],
        ["2026-02-16", "2026-04-16", 720, 150_000],
        ["2026-04-16", "2026-06-16", 650, 160_000],
        ["2026-06-16", "2026-08-16", 1500, 420_000],
        ["2026-08-16", "2026-09-16", 1000, 300_000],
      ].map(([periodStart, periodEnd, consumptionKwh, amountCents], index) => ({
        id: String(index),
        periodStart: String(periodStart),
        periodEnd: String(periodEnd),
        consumptionKwh: Number(consumptionKwh),
        amountCents: Number(amountCents),
        createdAt: "",
        updatedAt: "",
      })),
    );
    const summary = summarizeRange(bimonthly, "6");
    expect(summary?.bills).toHaveLength(4);
    expect(summary?.comparison?.basis).toBe("previousRange");
    expect(summary?.comparison?.savingsCents).toBeLessThan(0);
  });

  test("a single bill has nothing to compare", () => {
    expect(summarizeRange(bills.slice(0, 1), "all")?.comparison).toBeNull();
  });

  test("all time includes every bill", () => {
    expect(summarizeRange(bills, "all")?.totals.kwh).toBe(3398);
  });
});
