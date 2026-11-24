import { daysBetween } from "../../lib/dates";
import type { ElectricityBill } from "./bill";

// Official Mexican grid emission factor (FESEN 2024, SEMARNAT): 0.444 tCO2e/MWh.
export const gridEmissionKgPerKwh = 0.444;

export function billingDays(bill: ElectricityBill) {
  return daysBetween(bill.periodStart, bill.periodEnd);
}

export function dailyAverageKwh(bill: ElectricityBill) {
  return bill.consumptionKwh / billingDays(bill);
}

export function percentChange(previous: number, current: number) {
  if (!(previous > 0)) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

export function emissionsKg(consumptionKwh: number) {
  return consumptionKwh * gridEmissionKgPerKwh;
}

export function summarizeBills(newestFirst: ElectricityBill[]) {
  const [latest, previous] = newestFirst;
  if (!latest) {
    return null;
  }
  return {
    latest,
    previous: previous ?? null,
    consumptionChange: previous
      ? percentChange(previous.consumptionKwh, latest.consumptionKwh)
      : null,
    dailyAverage: dailyAverageKwh(latest),
    dailyAverageChange: previous
      ? percentChange(dailyAverageKwh(previous), dailyAverageKwh(latest))
      : null,
    emissionsKg: emissionsKg(latest.consumptionKwh),
    emissionsChangeKg: previous
      ? emissionsKg(latest.consumptionKwh - previous.consumptionKwh)
      : null,
    // Periods whose length differs by more than a week are not directly
    // comparable, so the UI warns instead of presenting a clean percentage.
    periodsDiffer: previous
      ? Math.abs(billingDays(latest) - billingDays(previous)) > 7
      : false,
  };
}

export type BillSummary = NonNullable<ReturnType<typeof summarizeBills>>;
