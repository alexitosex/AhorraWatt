import { daysBetween, parseDisplayDate } from "../../lib/dates";

export type ElectricityBill = {
  id: string;
  amountCents: number;
  consumptionKwh: number;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string | null;
};

export type BillInput = Pick<
  ElectricityBill,
  "amountCents" | "consumptionKwh" | "periodStart" | "periodEnd"
>;

export type BillDraft = {
  periodStart: string;
  periodEnd: string;
  consumptionKwh: string;
  amount: string;
};

export type BillErrors = Partial<Record<keyof BillDraft, string>>;

const maxBillingDays = 100;
const maxConsumptionKwh = 100_000;
const maxAmountMxn = 1_000_000;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function parseDecimal(text: string) {
  const normalized = text.replace(/[$,\s]/g, "");
  return /^\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : Number.NaN;
}

export function validateBillDraft(
  draft: BillDraft,
  existing: ElectricityBill[],
  today: string,
): { input?: BillInput; errors: BillErrors } {
  const errors: BillErrors = {};
  const periodStart = parseDisplayDate(draft.periodStart);
  const periodEnd = parseDisplayDate(draft.periodEnd);
  const consumptionKwh = parseDecimal(draft.consumptionKwh);
  const amountMxn = parseDecimal(draft.amount);

  if (!periodStart) {
    errors.periodStart = "Escribe una fecha válida (DD/MM/AAAA).";
  }
  if (!periodEnd) {
    errors.periodEnd = "Escribe una fecha válida (DD/MM/AAAA).";
  }
  if (periodStart && periodEnd) {
    const days = daysBetween(periodStart, periodEnd);
    if (days <= 0) {
      errors.periodEnd = "La fecha de fin debe ser posterior al inicio.";
    } else if (days > maxBillingDays) {
      errors.periodEnd = `El periodo no puede durar más de ${maxBillingDays} días.`;
    } else if (periodEnd > today) {
      errors.periodEnd = "La fecha de fin no puede estar en el futuro.";
    } else if (
      existing.some(
        (bill) => periodStart < bill.periodEnd && periodEnd > bill.periodStart,
      )
    ) {
      errors.periodStart = "Este periodo se cruza con un recibo registrado.";
    }
  }
  if (!(consumptionKwh > 0) || consumptionKwh > maxConsumptionKwh) {
    errors.consumptionKwh = "Escribe un consumo mayor a 0 kWh.";
  }
  if (!(amountMxn > 0) || amountMxn > maxAmountMxn) {
    errors.amount = "Escribe un monto mayor a $0.";
  }

  if (Object.keys(errors).length > 0 || !periodStart || !periodEnd) {
    return { errors };
  }
  return {
    input: {
      periodStart,
      periodEnd,
      consumptionKwh,
      amountCents: Math.round(amountMxn * 100),
    },
    errors,
  };
}

export function isElectricityBill(value: unknown): value is ElectricityBill {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const bill = value as Record<string, unknown>;
  return (
    typeof bill.id === "string" &&
    Number.isInteger(bill.amountCents) &&
    (bill.amountCents as number) > 0 &&
    typeof bill.consumptionKwh === "number" &&
    bill.consumptionKwh > 0 &&
    typeof bill.periodStart === "string" &&
    isoDatePattern.test(bill.periodStart) &&
    typeof bill.periodEnd === "string" &&
    isoDatePattern.test(bill.periodEnd) &&
    bill.periodEnd > bill.periodStart &&
    typeof bill.createdAt === "string" &&
    typeof bill.updatedAt === "string" &&
    (bill.paidAt === undefined ||
      bill.paidAt === null ||
      typeof bill.paidAt === "string")
  );
}

export function sortNewestFirst(bills: ElectricityBill[]) {
  return [...bills].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
}
