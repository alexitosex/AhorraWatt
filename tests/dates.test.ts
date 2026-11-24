import { describe, expect, test } from "bun:test";

import {
  daysBetween,
  formatPeriod,
  formatPeriodWithYear,
  maskDateInput,
  parseDisplayDate,
} from "../src/lib/dates";

describe("dates", () => {
  test("parses DD/MM/AAAA into ISO dates and rejects invalid ones", () => {
    expect(parseDisplayDate("29/02/2024")).toBe("2024-02-29");
    expect(parseDisplayDate("29/02/2026")).toBeNull();
    expect(parseDisplayDate("2026-01-01")).toBeNull();
  });

  test("counts days without time zone drift", () => {
    expect(daysBetween("2026-09-12", "2026-11-11")).toBe(60);
    expect(daysBetween("2026-03-01", "2026-04-01")).toBe(31);
  });

  test("formats periods in Spanish and adds years across a year change", () => {
    expect(formatPeriod("2026-10-12", "2026-11-11")).toBe("12 oct – 11 nov");
    expect(formatPeriod("2025-12-12", "2026-02-11")).toBe(
      "12 dic 2025 – 11 feb 2026",
    );
  });

  test("masks typed digits as a date", () => {
    expect(maskDateInput("12102026")).toBe("12/10/2026");
    expect(maskDateInput("1210")).toBe("12/10");
  });
});

test("adds the year to periods inside one year", () => {
  expect(formatPeriodWithYear("2026-10-12", "2026-11-11")).toBe(
    "12 oct – 11 nov 2026",
  );
  expect(formatPeriodWithYear("2025-12-12", "2026-01-11")).toBe(
    "12 dic 2025 – 11 ene 2026",
  );
});
