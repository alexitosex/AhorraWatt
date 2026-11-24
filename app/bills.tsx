import { useAuth } from "../src/features/auth/AuthProvider";
import { BillsScreen } from "../src/features/receipts/BillsScreen";

export default function BillsRoute() {
  const { state } = useAuth();
  if (state.status !== "signedIn") {
    return null;
  }
  return <BillsScreen key={state.account.id} accountId={state.account.id} />;
}
