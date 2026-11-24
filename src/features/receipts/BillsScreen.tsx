import { CircleCheck, Clock, Plus } from "lucide-react-native";
import { useRef, useState, type ComponentRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../components/ui/Card";
import { FadeInView } from "../../components/ui/FadeInView";
import {
  breakpoints,
  colors,
  layout,
  radii,
  spacing,
  typography,
} from "../../design-system/tokens";
import { formatPeriodWithYear } from "../../lib/dates";
import { formatKwh, formatMoney } from "../../lib/format";
import type { ScreenRect } from "../../types/layout";
import type { ElectricityBill } from "./bill";
import { RegisterBillModal } from "./components/RegisterBillModal";
import { useBills } from "./useBills";

const rowStagger = 60;

export function BillsScreen({ accountId }: { accountId: string }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= breakpoints.desktop;
  const contentWidth = width - (isDesktop ? layout.sidebarWidth : 0);
  const wide = contentWidth >= 720;
  const { state, addBill, setPaid } = useBills(accountId);
  const [registerOrigin, setRegisterOrigin] = useState<ScreenRect | null>(null);
  const [statusFailed, setStatusFailed] = useState(false);
  const addButtonRef = useRef<ComponentRef<typeof View>>(null);

  const togglePaid = async (bill: ElectricityBill) => {
    setStatusFailed(false);
    try {
      await setPaid(bill.id, !bill.paidAt);
    } catch {
      setStatusFailed(true);
    }
  };

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
    if (state.bills.length === 0) {
      return (
        <Card delay={90} style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Aún no tienes facturas</Text>
          <Text style={styles.message}>
            Agrega tu primer recibo de luz para verlo aquí.
          </Text>
        </Card>
      );
    }
    return (
      <Card delay={90} style={[styles.tableCard, !wide && styles.listCard]}>
        {wide && (
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.providerColumn]} />
            <Text style={[styles.headerCell, styles.periodColumn]}>
              Periodo de facturación
            </Text>
            <Text style={[styles.headerCell, styles.numberColumn]}>
              Consumo (kWh)
            </Text>
            <Text style={[styles.headerCell, styles.numberColumn]}>
              Importe (MXN)
            </Text>
            <Text style={[styles.headerCell, styles.statusColumn]}>Estado</Text>
          </View>
        )}
        {state.bills.map((bill, index) => (
          <FadeInView key={bill.id} delay={150 + index * rowStagger}>
            {wide ? (
              <View style={styles.row}>
                <Text style={[styles.provider, styles.providerColumn]}>
                  CFE
                </Text>
                <Text style={[styles.cell, styles.periodColumn]}>
                  {formatPeriodWithYear(bill.periodStart, bill.periodEnd)}
                </Text>
                <Text style={[styles.cell, styles.numberColumn]}>
                  {formatKwh(bill.consumptionKwh)} kWh
                </Text>
                <Text style={[styles.cell, styles.numberColumn]}>
                  {formatMoney(bill.amountCents / 100)}
                </Text>
                <View style={styles.statusColumn}>
                  <StatusBadge bill={bill} onToggle={togglePaid} />
                </View>
              </View>
            ) : (
              <View style={styles.listRow}>
                <View style={styles.listMain}>
                  <Text style={styles.provider}>CFE</Text>
                  <Text style={styles.cell}>
                    {formatPeriodWithYear(bill.periodStart, bill.periodEnd)}
                  </Text>
                  <Text style={styles.listDetail}>
                    {formatKwh(bill.consumptionKwh)} kWh ·{" "}
                    {formatMoney(bill.amountCents / 100)}
                  </Text>
                </View>
                <StatusBadge bill={bill} onToggle={togglePaid} />
              </View>
            )}
          </FadeInView>
        ))}
      </Card>
    );
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, wide && styles.contentWide]}
      >
        <View style={[styles.header, wide && styles.headerWide]}>
          <View style={styles.headerText}>
            <Text
              accessibilityRole="header"
              aria-level={1}
              style={[styles.title, wide && styles.titleWide]}
            >
              Facturas
            </Text>
            <Text style={styles.subtitle}>
              Gestiona y visualiza tus recibos de electricidad.
            </Text>
          </View>
          {state.status === "ready" && (
            <Pressable
              ref={addButtonRef}
              accessibilityRole="button"
              onPress={() =>
                addButtonRef.current?.measureInWindow((x, y, w, h) =>
                  setRegisterOrigin({ x, y, width: w, height: h }),
                )
              }
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.pressed,
              ]}
            >
              <Plus size={22} color={colors.surface} strokeWidth={2.5} />
              <Text style={styles.addText}>Agregar factura</Text>
            </Pressable>
          )}
        </View>
        {statusFailed && (
          <Text accessibilityRole="alert" style={styles.error}>
            No pudimos actualizar el estado. Intenta de nuevo.
          </Text>
        )}
        {renderContent()}
      </ScrollView>
      {registerOrigin && state.status === "ready" && (
        <RegisterBillModal
          origin={registerOrigin}
          title="Agregar factura"
          submitLabel="Agregar"
          existingBills={state.bills}
          onSubmit={addBill}
          onClose={() => setRegisterOrigin(null)}
        />
      )}
    </SafeAreaView>
  );
}

function StatusBadge({
  bill,
  onToggle,
}: {
  bill: ElectricityBill;
  onToggle: (bill: ElectricityBill) => void;
}) {
  const paid = Boolean(bill.paidAt);
  const Icon = paid ? CircleCheck : Clock;
  const color = paid ? colors.primary : colors.warningText;

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: paid }}
      accessibilityLabel={
        paid ? "Pagada. Marcar como pendiente" : "Pendiente. Marcar como pagada"
      }
      onPress={() => onToggle(bill)}
      style={({ pressed }) => [
        styles.badge,
        paid ? styles.badgePaid : styles.badgePending,
        pressed && styles.pressed,
      ]}
    >
      <Icon size={18} color={color} strokeWidth={2.5} />
      <Text style={[styles.badgeText, { color }]}>
        {paid ? "Pagada" : "Pendiente"}
      </Text>
    </Pressable>
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
    gap: spacing.lg,
    padding: spacing.lg,
  },
  contentWide: {
    gap: spacing.xl,
    padding: spacing.xxl,
  },
  header: {
    gap: spacing.md,
  },
  headerWide: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerText: {
    gap: spacing.xs,
  },
  title: {
    ...typography.title,
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
  },
  titleWide: {
    fontSize: 40,
  },
  subtitle: {
    ...typography.body,
    fontSize: 17,
    color: colors.textMuted,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    boxShadow: "0 6px 16px rgba(35, 131, 71, 0.3)",
    outlineWidth: 0,
  },
  addText: {
    ...typography.label,
    fontSize: 17,
    fontWeight: "700",
    color: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  error: {
    ...typography.caption,
    color: colors.error,
  },
  tableCard: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  listCard: {
    gap: 0,
    paddingVertical: spacing.sm,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.medium,
    backgroundColor: colors.surfaceMuted,
  },
  headerCell: {
    ...typography.label,
    fontSize: 15,
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  providerColumn: {
    width: 72,
  },
  periodColumn: {
    flex: 2,
  },
  numberColumn: {
    flex: 1,
    textAlign: "center",
  },
  statusColumn: {
    width: 150,
    alignItems: "center",
    textAlign: "center",
  },
  provider: {
    fontSize: 18,
    fontWeight: "800",
    fontStyle: "italic",
    color: colors.primary,
  },
  cell: {
    ...typography.body,
    fontSize: 17,
    color: colors.text,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  listMain: {
    flex: 1,
    gap: 2,
  },
  listDetail: {
    ...typography.caption,
    color: colors.textMuted,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    outlineWidth: 0,
  },
  badgePaid: {
    backgroundColor: colors.primaryLight,
  },
  badgePending: {
    backgroundColor: colors.tipBackground,
  },
  badgeText: {
    ...typography.label,
    fontSize: 15,
  },
  emptyCard: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.heading,
    color: colors.text,
  },
  status: {
    marginTop: spacing.xl,
  },
  message: {
    ...typography.body,
    textAlign: "center",
    color: colors.textMuted,
  },
});
