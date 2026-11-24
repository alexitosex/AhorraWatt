import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { sortNewestFirst, type BillInput, type ElectricityBill } from "./bill";
import { loadBills, saveBills } from "./billRepository";

type BillsState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; bills: ElectricityBill[] };

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useBills(accountId: string) {
  const [state, setState] = useState<BillsState>({ status: "loading" });

  // Reload on focus so a bill added on one screen shows up on the others.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadBills(accountId)
        .then((bills) => {
          if (active) {
            setState({ status: "ready", bills: sortNewestFirst(bills) });
          }
        })
        .catch(() => {
          if (active) {
            setState({ status: "error" });
          }
        });
      return () => {
        active = false;
      };
    }, [accountId]),
  );

  const commit = async (
    change: (bills: ElectricityBill[]) => ElectricityBill[],
  ) => {
    if (state.status !== "ready") {
      throw new Error("Bills are not loaded.");
    }
    const next = sortNewestFirst(change(state.bills));
    await saveBills(accountId, next);
    setState({ status: "ready", bills: next });
  };

  const addBill = (input: BillInput) => {
    const now = new Date().toISOString();
    return commit((bills) => [
      ...bills,
      {
        ...input,
        id: createId(),
        createdAt: now,
        updatedAt: now,
        paidAt: null,
      },
    ]);
  };

  const setPaid = (id: string, paid: boolean) => {
    const now = new Date().toISOString();
    return commit((bills) =>
      bills.map((bill) =>
        bill.id === id
          ? { ...bill, paidAt: paid ? now : null, updatedAt: now }
          : bill,
      ),
    );
  };

  return { state, addBill, setPaid };
}
