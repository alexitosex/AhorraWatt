import { Image } from "expo-image";
import { Link } from "expo-router";
import { useRef, type ComponentRef } from "react";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  ChartNoAxesColumn,
  ChevronRight,
  Leaf,
  FileText,
  Zap,
} from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Card } from "../../../components/ui/Card";
import { FadeInView } from "../../../components/ui/FadeInView";
import type { ScreenRect } from "../../../types/layout";
import {
  colors,
  radii,
  shadows,
  spacing,
  typography,
} from "../../../design-system/tokens";
import { useEntranceProgress } from "../../../hooks/useEntranceAnimation";
import { formatMonth, formatPeriod } from "../../../lib/dates";
import {
  formatKwh,
  formatMoney,
  formatPercent,
  formatSigned,
} from "../../../lib/format";
import type { ElectricityBill } from "../../receipts/bill";
import {
  billingDays,
  dailyAverageKwh,
  type BillSummary,
} from "../../receipts/billStats";
import { dailyTip } from "../../tips/dailyTip";
import { AreaSparkline, ConsumptionBarChart, ProgressRing } from "./Charts";
import {
  BulbIllustration,
  LeavesIllustration,
  TreesIllustration,
} from "./Illustrations";

const bannerBackground = require("../../../../assets/illustrations/banner-background.svg");

type CardProps = {
  wide: boolean;
  delay: number;
  style?: StyleProp<ViewStyle>;
};

type SummaryProps = CardProps & { summary: BillSummary };

const chartDelay = 200;
const countDuration = 1300;
const chartPeriods = 6;

// Short screens (e.g. 1366×768 laptops) get smaller charts so the dashboard
// fits without scrolling.
function useDense() {
  return useWindowDimensions().height < 860;
}

function ChangeIndicator({
  change,
  size,
  count,
  textStyle,
}: {
  change: number;
  size: number;
  count: number;
  textStyle: StyleProp<TextStyle>;
}) {
  const increased = change > 0;
  const color = increased ? colors.error : colors.primary;
  const Arrow = increased ? ArrowUp : ArrowDown;
  return (
    <>
      <Arrow size={size} color={color} strokeWidth={3} />
      <Text style={[textStyle, { color }]}>
        {formatPercent(Math.round(change * count))}
      </Text>
    </>
  );
}

export function GreetingBanner({
  wide,
  delay,
  onRegister,
}: CardProps & { onRegister?: (origin: ScreenRect) => void }) {
  return (
    <FadeInView
      delay={delay}
      style={[styles.banner, wide && styles.bannerWide]}
    >
      <Image
        source={bannerBackground}
        contentFit="fill"
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.bannerText}>
        <Text
          accessibilityRole="header"
          aria-level={1}
          style={[styles.greeting, wide && styles.greetingWide]}
        >
          ¡Hola! 👋
        </Text>
        <Text
          style={[styles.bannerSubtitle, wide && styles.bannerSubtitleWide]}
        >
          Tu consumo de energía
        </Text>
      </View>
      <View
        style={[styles.bannerLeaves, wide && styles.bannerLeavesWide]}
        pointerEvents="none"
      >
        <LeavesIllustration width={wide ? 240 : 120} />
      </View>
      {wide && onRegister && (
        <View style={styles.bannerActions}>
          <RegisterButton compact onPress={onRegister} />
        </View>
      )}
    </FadeInView>
  );
}

function SingleBillCard({ wide, delay, style, summary }: SummaryProps) {
  const count = useEntranceProgress(delay + chartDelay, countDuration);
  const { latest } = summary;
  const amount = latest.amountCents / 100;
  const facts = [
    { label: "Pagaste", value: formatMoney(amount) },
    { label: "Periodo", value: `${billingDays(latest)} días` },
    { label: "Por kWh", value: formatMoney(amount / latest.consumptionKwh) },
  ];

  return (
    <Card delay={delay} style={[styles.singleCard, style]}>
      <View style={styles.cardHeaderSpread}>
        <View style={styles.cardHeader}>
          <Zap size={22} color={colors.accent} fill={colors.accent} />
          <Text style={styles.cardTitleSmall}>Último recibo</Text>
        </View>
        <Text style={styles.singlePeriod}>
          {formatPeriod(latest.periodStart, latest.periodEnd)}
        </Text>
      </View>
      <Text style={[styles.monthlyValue, !wide && styles.monthlyValueCompact]}>
        {formatKwh(latest.consumptionKwh * count)}
        <Text style={[styles.monthlyUnit, !wide && styles.monthlyUnitCompact]}>
          {" "}
          kWh
        </Text>
      </Text>
      <View style={styles.facts}>
        {facts.map((fact) => (
          <View key={fact.label} style={styles.fact}>
            <Text numberOfLines={1} style={styles.factValue}>
              {fact.value}
            </Text>
            <Text style={styles.factLabel}>{fact.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function LatestBillCard(props: SummaryProps) {
  return props.summary.previous ? (
    <ComparedBillCard {...props} />
  ) : (
    <SingleBillCard {...props} />
  );
}

function ComparedBillCard({ wide, delay, style, summary }: SummaryProps) {
  const dense = useDense();
  const count = useEntranceProgress(delay + chartDelay, countDuration);
  const ringSize = wide ? (dense ? 136 : 164) : 120;
  const { latest, previous, consumptionChange } = summary;
  const progress = previous
    ? Math.min(
        Math.max(latest.consumptionKwh / previous.consumptionKwh, 0.05),
        1,
      )
    : 1;

  return (
    <Card delay={delay} style={[styles.todayCard, style]}>
      <ProgressRing
        size={ringSize}
        progress={progress}
        delay={delay + chartDelay}
      >
        <Zap size={ringSize * 0.2} color={colors.accent} fill={colors.accent} />
        <Text style={styles.ringValue}>
          <Text style={[styles.ringNumber, { fontSize: ringSize * 0.17 }]}>
            {formatKwh(latest.consumptionKwh * count)}
          </Text>
          <Text style={[styles.ringUnit, { fontSize: ringSize * 0.12 }]}>
            {" "}
            kWh
          </Text>
        </Text>
        <Text style={[styles.ringCaption, { fontSize: ringSize * 0.085 }]}>
          Último recibo
        </Text>
      </ProgressRing>
      <View style={styles.verticalDivider} />
      <View style={styles.todayStats}>
        {consumptionChange === null ? (
          <Text style={[styles.changeCaption, styles.centered]}>
            Registra otro recibo para comparar tu consumo.
          </Text>
        ) : (
          <>
            <View style={styles.changeRow}>
              <ChangeIndicator
                change={consumptionChange}
                size={wide ? 36 : 30}
                count={count}
                textStyle={[styles.changeValue, wide && styles.changeValueWide]}
              />
            </View>
            <Text
              style={[styles.changeCaption, wide && styles.changeCaptionWide]}
            >
              vs. periodo anterior
            </Text>
            {summary.periodsDiffer && (
              <Text style={styles.note}>Los periodos duran distinto.</Text>
            )}
            <View
              style={[
                styles.badge,
                consumptionChange > 0 && styles.warningSurface,
              ]}
            >
              <Leaf
                size={wide ? 20 : 14}
                color={consumptionChange > 0 ? colors.textMuted : colors.leaf}
                fill={consumptionChange > 0 ? "none" : colors.leaf}
              />
              <Text
                numberOfLines={1}
                style={[styles.badgeText, wide && styles.badgeTextWide]}
              >
                {consumptionChange > 0
                  ? "Tu consumo subió"
                  : "¡Vas por buen camino!"}
              </Text>
            </View>
          </>
        )}
        <Text style={styles.note}>
          {formatPeriod(latest.periodStart, latest.periodEnd)}
        </Text>
      </View>
    </Card>
  );
}

export function DailyAverageCard({
  wide,
  delay,
  style,
  summary,
  bills,
}: SummaryProps & { bills: ElectricityBill[] }) {
  const dense = useDense();
  const count = useEntranceProgress(delay + chartDelay, countDuration);
  const trend = bills
    .slice(0, 12)
    .reverse()
    .map((bill) => dailyAverageKwh(bill));

  return (
    <Card delay={delay} style={[styles.monthlyCard, style]}>
      <View style={styles.cardHeader}>
        <Calendar size={22} color={colors.surface} fill={colors.primary} />
        <Text style={styles.cardTitleSmall}>Promedio diario</Text>
      </View>
      <View style={styles.monthlyRow}>
        <Text
          style={[styles.monthlyValue, !wide && styles.monthlyValueCompact]}
        >
          {formatKwh(summary.dailyAverage * count)}
          <Text
            style={[styles.monthlyUnit, !wide && styles.monthlyUnitCompact]}
          >
            {" "}
            kWh/día
          </Text>
        </Text>
        {summary.dailyAverageChange !== null && (
          <View
            style={[
              styles.changePill,
              summary.dailyAverageChange > 0 && styles.warningSurface,
            ]}
          >
            <ChangeIndicator
              change={summary.dailyAverageChange}
              size={20}
              count={count}
              textStyle={styles.changePillText}
            />
          </View>
        )}
      </View>
      {trend.length >= 2 ? (
        <AreaSparkline
          values={trend}
          height={wide ? (dense ? 44 : 64) : 40}
          delay={delay + chartDelay}
        />
      ) : (
        <Text style={styles.note}>
          Registra otro recibo para ver tu tendencia.
        </Text>
      )}
    </Card>
  );
}

export function PeriodChartCard({
  delay,
  style,
  bills,
}: CardProps & { bills: ElectricityBill[] }) {
  const dense = useDense();
  const data = bills
    .slice(0, chartPeriods)
    .reverse()
    .map((bill) => ({
      key: bill.id,
      label: formatMonth(bill.periodEnd),
      name: formatPeriod(bill.periodStart, bill.periodEnd),
      kwh: bill.consumptionKwh,
    }));

  return (
    <Card delay={delay} style={style}>
      <View style={styles.cardHeader}>
        <ChartNoAxesColumn size={24} color={colors.primary} strokeWidth={3.5} />
        <Text style={styles.cardTitle}>Consumo por periodo</Text>
      </View>
      <ConsumptionBarChart
        data={data}
        highlightedIndex={data.length - 1}
        height={dense ? 88 : 120}
        delay={delay + chartDelay}
      />
    </Card>
  );
}

function BillRow({ bill, last }: { bill: ElectricityBill; last: boolean }) {
  return (
    <View style={[styles.billRow, !last && styles.billRowDivider]}>
      <FileText size={20} color={colors.text} />
      <Text style={styles.billPeriod}>
        {formatPeriod(bill.periodStart, bill.periodEnd)}
      </Text>
      <Text style={styles.billAmount}>
        {formatMoney(bill.amountCents / 100)}
      </Text>
    </View>
  );
}

export function BillHistoryCard({
  wide,
  delay,
  style,
  bills,
}: CardProps & { bills: ElectricityBill[] }) {
  const recent = bills.slice(0, 3);

  return (
    <Card delay={delay} style={style}>
      <Link href="/bills" asChild>
        <Pressable
          accessibilityRole="link"
          style={StyleSheet.flatten([styles.cardHeader, styles.billHeader])}
        >
          {wide && <FileText size={24} color={colors.primary} />}
          <Text style={[styles.cardTitle, styles.billTitle]}>
            Historial de recibos
          </Text>
          <ChevronRight size={22} color={colors.text} />
        </Pressable>
      </Link>
      {recent.map((bill, index) => (
        <BillRow key={bill.id} bill={bill} last={index === recent.length - 1} />
      ))}
    </Card>
  );
}

export function TipCard({ wide, delay, style }: CardProps) {
  return (
    <FadeInView
      delay={delay}
      style={[styles.tipCard, wide && styles.tipCardWide, style]}
    >
      <BulbIllustration size={wide ? 84 : 68} />
      <View style={styles.tipText}>
        <Text style={[styles.tipTitle, wide && styles.tipTitleWide]}>
          Consejo de hoy:
        </Text>
        <Text style={[styles.tipBody, wide && styles.tipBodyWide]}>
          {dailyTip()}
        </Text>
      </View>
    </FadeInView>
  );
}

export function ImpactCard({ delay, style, summary }: SummaryProps) {
  const change = summary.emissionsChangeKg;

  return (
    <Card delay={delay} style={[styles.impactCard, style]}>
      <View style={styles.impactTrees} pointerEvents="none">
        <TreesIllustration width={240} />
      </View>
      <View style={styles.cardHeader}>
        <Leaf size={24} color={colors.leaf} fill={colors.leaf} />
        <Text style={styles.cardTitle}>Tu impacto</Text>
      </View>
      <Text
        style={[
          styles.impactValue,
          change !== null && change > 0 && styles.impactValueUp,
        ]}
      >
        {change === null
          ? summary.emissionsKg.toFixed(1)
          : formatSigned(change)}{" "}
        kg CO₂
      </Text>
      <Text style={styles.changeCaption}>
        {change === null ? "en tu último periodo" : "vs. periodo anterior"}
      </Text>
      <Text style={[styles.note, styles.impactNote]}>
        Estimado con el factor oficial de SEMARNAT (2024).
      </Text>
    </Card>
  );
}

export function EmptyStateCard({
  delay,
  style,
  onRegister,
}: CardProps & { onRegister: (origin: ScreenRect) => void }) {
  return (
    <Card delay={delay} style={[styles.emptyCard, style]}>
      <FileText size={40} color={colors.primary} />
      <Text style={styles.emptyTitle}>Registra tu primer recibo</Text>
      <Text style={styles.emptyBody}>
        Con los datos de tu recibo de luz calculamos tu consumo, tu promedio
        diario y tu impacto.
      </Text>
      <RegisterButton onPress={onRegister} />
    </Card>
  );
}

export function RegisterButton({
  delay = 0,
  compact = false,
  onPress,
}: {
  delay?: number;
  compact?: boolean;
  onPress: (origin: ScreenRect) => void;
}) {
  const buttonRef = useRef<ComponentRef<typeof View>>(null);
  const iconSize = compact ? 18 : 24;

  return (
    <FadeInView delay={delay}>
      <Pressable
        ref={buttonRef}
        accessibilityRole="button"
        onPress={() =>
          buttonRef.current?.measureInWindow((x, y, width, height) =>
            onPress({ x, y, width, height }),
          )
        }
        style={({ pressed }) => [
          styles.registerButton,
          compact && styles.registerButtonCompact,
          pressed && styles.registerPressed,
        ]}
      >
        <Zap size={iconSize} color={colors.surface} fill={colors.surface} />
        <Text
          style={[styles.registerText, compact && styles.registerTextCompact]}
        >
          Registrar mi consumo
        </Text>
      </Pressable>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 72,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: radii.card,
    overflow: "hidden",
  },
  bannerWide: {
    minHeight: 112,
    paddingHorizontal: spacing.xl,
  },
  bannerText: {
    gap: spacing.xs,
    paddingEnd: 80,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  greetingWide: {
    fontSize: 30,
  },
  bannerSubtitle: {
    ...typography.caption,
    fontSize: 15,
    color: colors.text,
  },
  bannerSubtitleWide: {
    fontSize: 18,
    color: colors.textMuted,
  },
  bannerLeaves: {
    position: "absolute",
    right: -8,
    bottom: -14,
  },
  bannerLeavesWide: {
    right: "24%",
    bottom: -26,
  },
  bannerActions: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  todayCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  ringValue: {
    marginTop: spacing.xs,
  },
  ringNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },
  ringUnit: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  ringCaption: {
    ...typography.caption,
    color: colors.text,
  },
  verticalDivider: {
    alignSelf: "stretch",
    width: 1,
    marginVertical: spacing.lg,
    backgroundColor: colors.border,
  },
  todayStats: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeValue: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.primary,
  },
  changeValueWide: {
    fontSize: 40,
  },
  changeCaption: {
    ...typography.caption,
    color: colors.text,
  },
  changeCaptionWide: {
    fontSize: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.small,
    backgroundColor: colors.primarySoft,
  },
  badgeText: {
    ...typography.small,
    fontSize: 11,
    color: colors.text,
  },
  badgeTextWide: {
    fontSize: 14,
  },
  centered: {
    textAlign: "center",
  },
  note: {
    ...typography.small,
    fontSize: 13,
    textAlign: "center",
    color: colors.textMuted,
  },
  warningSurface: {
    backgroundColor: colors.errorSoft,
  },
  impactValueUp: {
    color: colors.error,
  },
  impactNote: {
    marginTop: "auto",
    maxWidth: "55%",
    textAlign: "left",
  },
  emptyCard: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.heading,
    color: colors.text,
    textAlign: "center",
  },
  emptyBody: {
    ...typography.body,
    maxWidth: 420,
    marginBottom: spacing.sm,
    textAlign: "center",
    color: colors.textMuted,
  },
  singleCard: {
    justifyContent: "space-between",
    gap: spacing.md,
  },
  singlePeriod: {
    ...typography.caption,
    color: colors.textMuted,
  },
  facts: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  fact: {
    flex: 1,
    minWidth: 0,
    gap: 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.small,
    backgroundColor: colors.primaryLight,
  },
  factValue: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  factLabel: {
    ...typography.small,
    fontSize: 13,
    color: colors.textMuted,
  },
  monthlyCard: {
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  cardHeaderSpread: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.cardTitle,
    color: colors.text,
  },
  cardTitleSmall: {
    ...typography.label,
    color: colors.text,
  },
  monthlyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  monthlyValue: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.text,
  },
  monthlyValueCompact: {
    fontSize: 30,
  },
  monthlyUnitCompact: {
    fontSize: 22,
  },
  monthlyUnit: {
    fontSize: 30,
  },
  changePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
  },
  changePillText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  billHeader: {
    marginBottom: spacing.xs,
  },
  billTitle: {
    flex: 1,
  },
  billRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    paddingVertical: 6,
  },
  billRowDivider: {
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  billPeriod: {
    flex: 1,
    ...typography.caption,
    fontSize: 15,
    color: colors.text,
  },
  billAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.card,
    backgroundColor: colors.tipBackground,
    ...shadows.card,
  },
  tipCardWide: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  tipText: {
    flex: 1,
    gap: spacing.xs,
  },
  tipTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  tipTitleWide: {
    fontSize: 20,
  },
  tipBody: {
    ...typography.caption,
    lineHeight: 19,
    color: colors.text,
  },
  tipBodyWide: {
    fontSize: 15,
    lineHeight: 22,
  },
  impactCard: {
    gap: spacing.sm,
    overflow: "hidden",
  },
  impactTrees: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  impactValue: {
    marginTop: spacing.lg,
    fontSize: 30,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  registerButton: {
    paddingHorizontal: spacing.xl,
    outlineWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    minHeight: 54,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryDark,
    ...shadows.raised,
  },
  registerButtonCompact: {
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  registerText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.surface,
  },
  registerPressed: {
    opacity: 0.8,
  },
  registerTextCompact: {
    fontSize: 15,
  },
});
