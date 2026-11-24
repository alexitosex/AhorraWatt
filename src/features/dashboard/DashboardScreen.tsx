import { useState } from "react";
import { LogOut } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Logo } from "../../components/ui/Logo";
import type { ScreenRect } from "../../types/layout";
import {
  breakpoints,
  colors,
  layout,
  radii,
  spacing,
  typography,
} from "../../design-system/tokens";
import { useAuth } from "../auth/AuthProvider";
import type { ElectricityBill } from "../receipts/bill";
import { summarizeBills, type BillSummary } from "../receipts/billStats";
import { RegisterBillModal } from "../receipts/components/RegisterBillModal";
import { useBills } from "../receipts/useBills";
import {
  BillHistoryCard,
  DailyAverageCard,
  EmptyStateCard,
  GreetingBanner,
  ImpactCard,
  LatestBillCard,
  PeriodChartCard,
  RegisterButton,
  TipCard,
} from "./components/DashboardCards";

const stagger = 90;

export function DashboardScreen({ accountId }: { accountId: string }) {
  const { width, height, fontScale } = useWindowDimensions();
  const isDesktop = width >= breakpoints.desktop;
  const contentWidth = width - (isDesktop ? layout.sidebarWidth : 0);
  const wide = contentWidth >= 720 && fontScale <= 1.3;
  const cardStyle = !wide || height < 860 ? styles.compactCard : undefined;
  const { signOut } = useAuth();
  const { state, addBill } = useBills(accountId);
  const [registerOrigin, setRegisterOrigin] = useState<ScreenRect | null>(null);
  const bills = state.status === "ready" ? state.bills : [];
  const summary = summarizeBills(bills);

  const renderContent = () => {
    if (state.status === "loading") {
      return <ActivityIndicator color={colors.primary} style={styles.status} />;
    }
    if (state.status === "error") {
      return (
        <Text style={[styles.message, styles.status]}>
          No pudimos cargar tus recibos. Cierra y vuelve a abrir la app.
        </Text>
      );
    }
    if (!summary) {
      return (
        <>
          <EmptyStateCard
            wide={wide}
            delay={stagger}
            style={cardStyle}
            onRegister={setRegisterOrigin}
          />
          <TipCard wide={wide} delay={stagger * 2} />
        </>
      );
    }
    if (wide) {
      return (
        <WideLayout bills={bills} summary={summary} cardStyle={cardStyle} />
      );
    }
    return (
      <>
        <LatestBillCard
          wide={false}
          delay={stagger}
          summary={summary}
          style={cardStyle}
        />
        <DailyAverageCard
          wide={false}
          delay={stagger * 2}
          summary={summary}
          bills={bills}
          style={cardStyle}
        />
        <BillHistoryCard
          wide={false}
          delay={stagger * 3}
          bills={bills}
          style={cardStyle}
        />
        <View style={styles.fill} />
        <RegisterButton delay={stagger * 4} onPress={setRegisterOrigin} />
      </>
    );
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, wide && styles.contentWide]}
      >
        {!isDesktop && (
          <View style={styles.header}>
            <Logo size={wide ? 26 : 24} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
              onPress={signOut}
              style={styles.avatar}
            >
              <LogOut size={22} color={colors.primaryDark} />
            </Pressable>
          </View>
        )}

        <GreetingBanner
          wide={wide}
          delay={0}
          onRegister={summary ? setRegisterOrigin : undefined}
        />
        {renderContent()}
      </ScrollView>
      {registerOrigin && state.status === "ready" && (
        <RegisterBillModal
          origin={registerOrigin}
          existingBills={bills}
          onSubmit={addBill}
          onClose={() => setRegisterOrigin(null)}
        />
      )}
    </SafeAreaView>
  );
}

function WideLayout({
  bills,
  summary,
  cardStyle,
}: {
  bills: ElectricityBill[];
  summary: BillSummary;
  cardStyle: ViewStyle | undefined;
}) {
  return (
    <>
      <View style={styles.row}>
        <LatestBillCard
          wide
          delay={stagger}
          summary={summary}
          style={[styles.mainColumn, cardStyle]}
        />
        <DailyAverageCard
          wide
          delay={stagger * 2}
          summary={summary}
          bills={bills}
          style={[styles.sideColumn, cardStyle]}
        />
      </View>
      <View style={styles.row}>
        <PeriodChartCard
          wide
          delay={stagger * 3}
          bills={bills}
          style={[styles.mainColumn, cardStyle]}
        />
        <ImpactCard
          wide
          delay={stagger * 4}
          summary={summary}
          style={[styles.sideColumn, cardStyle]}
        />
      </View>
      <View style={styles.row}>
        <TipCard wide delay={stagger * 5} style={styles.mainColumn} />
        <BillHistoryCard
          wide
          delay={stagger * 6}
          bills={bills}
          style={[styles.sideColumn, cardStyle]}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    alignSelf: "center",
    width: "100%",
    maxWidth: layout.contentMaxWidth,
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  contentWide: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  compactCard: {
    padding: spacing.lg,
  },
  fill: {
    flexGrow: 1,
  },
  status: {
    marginTop: spacing.xxl,
  },
  message: {
    ...typography.body,
    textAlign: "center",
    color: colors.textMuted,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  row: {
    flexGrow: 1,
    flexDirection: "row",
    gap: spacing.lg,
  },
  mainColumn: {
    flex: 1.1,
    minWidth: 0,
  },
  sideColumn: {
    flex: 1,
    minWidth: 0,
  },
});
