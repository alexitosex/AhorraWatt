import { describe, expect, test } from "bun:test";

import type { ElectricityBill } from "../src/features/receipts/bill";
import {
  dailyAverageKwh,
  percentChange,
  summarizeBills,
} from "../src/features/receipts/billStats";

function bill(
  periodStart: string,
  periodEnd: string,
  consumptionKwh: number,
): ElectricityBill {
  return {
    id: periodEnd,
    amountCents: 100_000,
    consumptionKwh,
    periodStart,
    periodEnd,
    createdAt: "",
    updatedAt: "",
  };
}

describe("percentChange", () => {
  test("returns the change against a positive baseline", () => {
    expect(percentChange(500, 410)).toBeCloseTo(-18);
    expect(percentChange(400, 500)).toBeCloseTo(25);
  });

  test("returns null for zero or invalid baselines", () => {
    expect(percentChange(0, 100)).toBeNull();
    expect(percentChange(-10, 100)).toBeNull();
  });
});

describe("summarizeBills", () => {
  test("returns null without bills", () => {
    expect(summarizeBills([])).toBeNull();
  });

  test("has no comparison with a single bill", () => {
    const summary = summarizeBills([bill("2026-09-11", "2026-11-10", 420)]);
    expect(summary?.consumptionChange).toBeNull();
    expect(summary?.emissionsChangeKg).toBeNull();
    expect(summary?.dailyAverage).toBeCloseTo(7);
  });

  test("compares the latest bill with the previous one", () => {
    const latest = bill("2026-09-11", "2026-11-10", 420);
    const previous = bill("2026-07-13", "2026-09-11", 600);
    const summary = summarizeBills([latest, previous]);
    expect(summary?.consumptionChange).toBeCloseTo(-30);
    expect(summary?.emissionsChangeKg).toBeCloseTo(-180 * 0.444);
    expect(summary?.periodsDiffer).toBe(false);
  });

  test("flags periods of very different length", () => {
    const summary = summarizeBills([
      bill("2026-10-11", "2026-11-10", 300),
      bill("2026-08-11", "2026-10-11", 600),
    ]);
    expect(summary?.periodsDiffer).toBe(true);
    expect(dailyAverageKwh(bill("2026-10-11", "2026-11-10", 300))).toBeCloseTo(
      10,
    );
  });
});
