import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { claimLegacyBills } from "../receipts/billRepository";
import {
  loadAccounts,
  loadSessionAccountId,
  saveAccounts,
  saveSession,
} from "./accountRepository";
import {
  createSalt,
  findAccount,
  hashPassword,
  normalizeEmail,
  validateSignUp,
  type Account,
  type CredentialErrors,
} from "./credentials";

type AuthState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "signedOut" }
  | { status: "signedIn"; account: Account };

type AuthContextValue = {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<CredentialErrors>;
  signUp: (
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<CredentialErrors>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function createId() {
  return `${Date.now().toString(36)}-${createSalt().slice(0, 8)}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    Promise.all([loadAccounts(), loadSessionAccountId()])
      .then(([accounts, accountId]) => {
        if (!active) {
          return;
        }
        const account = accounts.find(
          (candidate) => candidate.id === accountId,
        );
        setState(
          account ? { status: "signedIn", account } : { status: "signedOut" },
        );
      })
      .catch(() => {
        if (active) {
          setState({ status: "error" });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const account = findAccount(email, password, await loadAccounts());
    if (!account) {
      return { form: "Correo o contraseña incorrectos." };
    }
    await saveSession(account.id);
    setState({ status: "signedIn", account });
    return {};
  };

  const signUp = async (
    email: string,
    password: string,
    confirmPassword: string,
  ) => {
    const accounts = await loadAccounts();
    const errors = validateSignUp(email, password, confirmPassword, accounts);
    if (Object.keys(errors).length > 0) {
      return errors;
    }
    const salt = createSalt();
    const account: Account = {
      id: createId(),
      email: normalizeEmail(email),
      salt,
      passwordHash: hashPassword(password, salt),
      createdAt: new Date().toISOString(),
    };
    await saveAccounts([...accounts, account]);
    if (accounts.length === 0) {
      await claimLegacyBills(account.id);
    }
    await saveSession(account.id);
    setState({ status: "signedIn", account });
    return {};
  };

  const signOut = async () => {
    await saveSession(null);
    setState({ status: "signedOut" });
  };

  return (
    <AuthContext.Provider value={{ state, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
