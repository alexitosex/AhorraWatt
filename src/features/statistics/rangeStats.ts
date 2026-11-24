import type { ElectricityBill } from "../receipts/bill";
import { billingDays, percentChange } from "../receipts/billStats";

export type StatsRange = "3" | "6" | "12" | "all";

export const rangeOptions: { value: StatsRange; label: string }[] = [
  { value: "3", label: "Últimos 3 meses" },
  { value: "6", label: "Últimos 6 meses" },
  { value: "12", label: "Último año" },
  { value: "all", label: "Todo" },
];

function shiftMonths(isoDate: string, months: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + months, day))
    .toISOString()
    .slice(0, 10);
}

function totals(bills: ElectricityBill[]) {
  return {
    kwh: bills.reduce((sum, bill) => sum + bill.consumptionKwh, 0),
    cents: bills.reduce((sum, bill) => sum + bill.amountCents, 0),
  };
}

// Bills cover different numbers of days (monthly, bimonthly), so ranges are
// compared by their daily consumption and spending, not by raw totals.
function dailyRates(bills: ElectricityBill[]) {
  const days = bills.reduce((sum, bill) => sum + billingDays(bill), 0);
  const { kwh, cents } = totals(bills);
  return { days, kwhPerDay: kwh / days, centsPerDay: cents / days };
}

function compare(base: ElectricityBill[], target: ElectricityBill[]) {
  const before = dailyRates(base);
  const after = dailyRates(target);
  return {
    consumptionChange: percentChange(before.kwhPerDay, after.kwhPerDay),
    spendingChange: percentChange(before.centsPerDay, after.centsPerDay),
    savingsCents: Math.round(
      (before.centsPerDay - after.centsPerDay) * after.days,
    ),
  };
}

export function summarizeRange(
  newestFirst: ElectricityBill[],
  range: StatsRange,
) {
  if (newestFirst.length === 0) {
    return null;
  }
  let current = newestFirst;
  let previous: ElectricityBill[] = [];
  if (range !== "all") {
    const months = Number(range);
    const latestEnd = newestFirst[0].periodEnd;
    const rangeStart = shiftMonths(latestEnd, -months);
    const previousStart = shiftMonths(latestEnd, -months * 2);
    current = newestFirst.filter((bill) => bill.periodEnd > rangeStart);
    previous = newestFirst.filter(
      (bill) => bill.periodEnd > previousStart && bill.periodEnd <= rangeStart,
    );
  }

  // Without bills in the previous range, the latest bill is compared with the
  // earlier ones inside the range.
  const comparison =
    previous.length > 0
      ? { ...compare(previous, current), basis: "previousRange" as const }
      : current.length >= 2
        ? {
            ...compare(current.slice(1), current.slice(0, 1)),
            basis: "earlierBills" as const,
          }
        : null;

  return {
    bills: current,
    totals: totals(current),
    comparison,
  };
}

export type RangeSummary = NonNullable<ReturnType<typeof summarizeRange>>;
