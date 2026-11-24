import {
  ArrowDown,
  ArrowUp,
  Calendar,
  ChevronDown,
  Leaf,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react-native";
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
import { PopupMenu } from "../../components/ui/PopupMenu";
import {
  breakpoints,
  colors,
  layout,
  radii,
  spacing,
  typography,
} from "../../design-system/tokens";
import { formatMonth, formatPeriod } from "../../lib/dates";
import { formatKwh, formatMoney, formatPercent } from "../../lib/format";
import type { ScreenRect } from "../../types/layout";
import { useBills } from "../receipts/useBills";
import {
  ConsumptionLineChart,
  type LinePoint,
} from "./components/ConsumptionLineChart";
import {
  rangeOptions,
  summarizeRange,
  type RangeSummary,
  type StatsRange,
} from "./rangeStats";

const stagger = 90;

export function StatisticsScreen({ accountId }: { accountId: string }) {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= breakpoints.desktop;
  const contentWidth = width - (isDesktop ? layout.sidebarWidth : 0);
  const wide = contentWidth >= 720;
  const { state } = useBills(accountId);
  const [range, setRange] = useState<StatsRange>("6");
  const summary =
    state.status === "ready" ? summarizeRange(state.bills, range) : null;

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
        <Card delay={stagger} style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Aún no hay estadísticas</Text>
          <Text style={styles.message}>
            Registra tus recibos en Inicio para ver tu consumo, gasto y ahorro.
          </Text>
        </Card>
      );
    }
    return (
      <StatisticsContent
        summary={summary}
        wide={wide}
        chartHeight={Math.max(height - (wide ? 500 : 745), 120)}
      />
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
              Estadísticas
            </Text>
            <Text style={styles.subtitle}>
              Analiza tu consumo, gasto y ahorro de energía.
            </Text>
          </View>
          {summary && <RangeSelector value={range} onChange={setRange} />}
        </View>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatisticsContent({
  summary,
  wide,
  chartHeight,
}: {
  summary: RangeSummary;
  wide: boolean;
  chartHeight: number;
}) {
  const bills = [...summary.bills].reverse();
  const crossesYear =
    bills.length > 0 &&
    bills[0].periodEnd.slice(0, 4) !==
      bills[bills.length - 1].periodEnd.slice(0, 4);
  const points: LinePoint[] = bills.map((bill) => ({
    key: bill.id,
    label: crossesYear
      ? `${formatMonth(bill.periodEnd)} ${bill.periodEnd.slice(2, 4)}`
      : formatMonth(bill.periodEnd),
    detail: formatPeriod(bill.periodStart, bill.periodEnd),
    kwh: bill.consumptionKwh,
  }));
  const { comparison } = summary;
  const savings = comparison?.savingsCents ?? null;
  const noComparison = "Registra más recibos para comparar";
  const changeLabel =
    comparison?.basis === "previousRange"
      ? "por día vs. periodo anterior"
      : "último recibo vs. anteriores, por día";

  return (
    <>
      <View style={[styles.metrics, wide && styles.metricsWide]}>
        <MetricCard
          compact={!wide}
          delay={stagger}
          icon={Zap}
          iconColor={colors.accent}
          title="Consumo total"
          value={`${formatKwh(summary.totals.kwh)} kWh`}
          change={comparison?.consumptionChange ?? null}
          changeLabel={changeLabel}
          caption={noComparison}
        />
        <MetricCard
          compact={!wide}
          delay={stagger * 2}
          icon={Wallet}
          iconColor={colors.primary}
          title="Gasto total"
          value={`${formatMoney(summary.totals.cents / 100)} MXN`}
          change={comparison?.spendingChange ?? null}
          changeLabel={changeLabel}
          caption={noComparison}
        />
        <MetricCard
          compact={!wide}
          delay={stagger * 3}
          icon={Leaf}
          iconColor={colors.primary}
          iconFill
          title={
            savings !== null && savings < 0 ? "Gasto extra" : "Ahorro estimado"
          }
          value={
            savings === null
              ? "—"
              : `${formatMoney(Math.abs(savings) / 100)} MXN`
          }
          caption={savings === null ? noComparison : changeLabel}
          highlightCaption={savings !== null}
          tone={savings !== null && savings < 0 ? "bad" : "good"}
        />
      </View>
      <Card delay={stagger * 4} style={styles.chartCard}>
        <Text style={styles.chartTitle}>Consumo de energía</Text>
        <Text style={styles.chartUnit}>kWh por recibo</Text>
        {points.length >= 2 ? (
          <ConsumptionLineChart
            points={points}
            height={chartHeight}
            delay={stagger * 4 + 200}
          />
        ) : (
          <Text style={[styles.message, styles.status]}>
            Necesitas al menos dos recibos en este rango para ver la gráfica.
          </Text>
        )}
      </Card>
    </>
  );
}

function MetricCard({
  compact,
  delay,
  icon: Icon,
  iconColor,
  iconFill = false,
  title,
  value,
  change,
  changeLabel,
  caption,
  highlightCaption = false,
  tone,
}: {
  compact: boolean;
  delay: number;
  icon: LucideIcon;
  iconColor: string;
  iconFill?: boolean;
  title: string;
  value: string;
  change?: number | null;
  changeLabel?: string;
  caption: string;
  highlightCaption?: boolean;
  tone?: "good" | "bad";
}) {
  const changeIsBad = change !== undefined && change !== null && change > 0;
  const color =
    tone === "bad" || (tone === undefined && changeIsBad)
      ? colors.error
      : colors.primary;
  const Arrow = changeIsBad ? ArrowUp : ArrowDown;

  return (
    <Card
      delay={delay}
      style={[styles.metric, compact && styles.metricCompact]}
    >
      <Icon
        size={compact ? 26 : 36}
        color={iconColor}
        fill={iconFill ? colors.primaryLight : "none"}
        strokeWidth={2}
      />
      <View style={styles.metricText}>
        <Text style={styles.metricTitle}>{title}</Text>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[styles.metricValue, compact && styles.metricValueCompact]}
        >
          {value}
        </Text>
        {change !== undefined && change !== null ? (
          <View style={styles.metricChange}>
            <Arrow size={16} color={color} strokeWidth={3} />
            <Text style={[styles.metricChangeText, { color }]}>
              {formatPercent(Math.round(change))} {changeLabel}
            </Text>
          </View>
        ) : (
          <Text style={[styles.metricCaption, highlightCaption && { color }]}>
            {caption}
          </Text>
        )}
      </View>
    </Card>
  );
}

function RangeSelector({
  value,
  onChange,
}: {
  value: StatsRange;
  onChange: (value: StatsRange) => void;
}) {
  const triggerRef = useRef<ComponentRef<typeof View>>(null);
  const [anchor, setAnchor] = useState<ScreenRect | null>(null);
  const label = rangeOptions.find((option) => option.value === value)?.label;

  return (
    <>
      <Pressable
        ref={triggerRef}
        accessibilityRole="button"
        accessibilityLabel={`Rango: ${label}`}
        accessibilityState={{ expanded: anchor !== null }}
        onPress={() =>
          triggerRef.current?.measureInWindow((x, y, width, height) =>
            setAnchor({ x, y, width, height }),
          )
        }
        style={({ pressed }) => [styles.selector, pressed && styles.pressed]}
      >
        <Calendar size={20} color={colors.text} />
        <Text style={styles.selectorText}>{label}</Text>
        <ChevronDown size={20} color={colors.text} />
      </Pressable>
      <PopupMenu
        anchor={anchor}
        options={rangeOptions}
        selected={value}
        onSelect={onChange}
        onClose={() => setAnchor(null)}
      />
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
    gap: spacing.md,
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
    color: colors.text,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    boxShadow: "0 4px 14px rgba(23, 35, 27, 0.08)",
    outlineWidth: 0,
  },
  selectorText: {
    ...typography.label,
    fontSize: 16,
    color: colors.text,
  },
  pressed: {
    opacity: 0.6,
  },
  metrics: {
    gap: spacing.md,
  },
  metricsWide: {
    flexDirection: "row",
  },
  metricCompact: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  metricValueCompact: {
    fontSize: 22,
  },
  metric: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
  },
  metricText: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  metricTitle: {
    ...typography.label,
    fontSize: 16,
    color: colors.text,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },
  metricChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metricChangeText: {
    ...typography.label,
    fontSize: 14,
  },
  metricCaption: {
    ...typography.small,
    fontSize: 13,
    color: colors.textMuted,
  },
  chartCard: {
    gap: spacing.xs,
  },
  chartTitle: {
    ...typography.heading,
    color: colors.text,
  },
  chartUnit: {
    ...typography.caption,
    color: colors.textMuted,
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
