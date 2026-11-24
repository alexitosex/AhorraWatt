import AsyncStorage from "@react-native-async-storage/async-storage";

import { isElectricityBill, type ElectricityBill } from "./bill";

// Bills saved before accounts existed; the first account created claims them.
const legacyKey = "ahorrawatt.bills.v1";

function storageKey(accountId: string) {
  return `${legacyKey}:${accountId}`;
}

export async function loadBills(accountId: string) {
  const raw = await AsyncStorage.getItem(storageKey(accountId));
  if (raw === null) {
    return [];
  }
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Stored bills are not a list.");
  }
  return parsed.filter(isElectricityBill);
}

export async function saveBills(accountId: string, bills: ElectricityBill[]) {
  await AsyncStorage.setItem(storageKey(accountId), JSON.stringify(bills));
}

export async function claimLegacyBills(accountId: string) {
  const raw = await AsyncStorage.getItem(legacyKey);
  if (raw === null) {
    return;
  }
  await AsyncStorage.setItem(storageKey(accountId), raw);
  await AsyncStorage.removeItem(legacyKey);
}
