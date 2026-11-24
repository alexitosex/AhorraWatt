import { useAuth } from "../src/features/auth/AuthProvider";
import { StatisticsScreen } from "../src/features/statistics/StatisticsScreen";

export default function StatisticsRoute() {
  const { state } = useAuth();
  if (state.status !== "signedIn") {
    return null;
  }
  return (
    <StatisticsScreen key={state.account.id} accountId={state.account.id} />
  );
}
