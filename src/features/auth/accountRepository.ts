import AsyncStorage from "@react-native-async-storage/async-storage";

import { isAccount, type Account } from "./credentials";

const accountsKey = "ahorrawatt.accounts.v1";
const sessionKey = "ahorrawatt.session.v1";

export async function loadAccounts() {
  const raw = await AsyncStorage.getItem(accountsKey);
  if (raw === null) {
    return [];
  }
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Stored accounts are not a list.");
  }
  return parsed.filter(isAccount);
}

export async function saveAccounts(accounts: Account[]) {
  await AsyncStorage.setItem(accountsKey, JSON.stringify(accounts));
}

export function loadSessionAccountId() {
  return AsyncStorage.getItem(sessionKey);
}

export async function saveSession(accountId: string | null) {
  if (accountId === null) {
    await AsyncStorage.removeItem(sessionKey);
  } else {
    await AsyncStorage.setItem(sessionKey, accountId);
  }
}
