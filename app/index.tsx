import { useAuth } from "../src/features/auth/AuthProvider";
import { DashboardScreen } from "../src/features/dashboard/DashboardScreen";

export default function HomeScreen() {
  const { state } = useAuth();
  if (state.status !== "signedIn") {
    return null;
  }
  return (
    <DashboardScreen key={state.account.id} accountId={state.account.id} />
  );
}
