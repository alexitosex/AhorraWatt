import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

import {
  colors,
  radii,
  spacing,
  typography,
} from "../../../design-system/tokens";
import { useEntranceProgress } from "../../../hooks/useEntranceAnimation";
import { axisFormatter, axisTicks, smoothPath } from "../../../lib/chart";
import { formatKwh } from "../../../lib/format";

export type LinePoint = {
  key: string;
  label: string;
  detail: string;
  kwh: number;
};

const axisWidth = 40;
const edgePadding = 24;
const tooltipWidth = 136;

export function ConsumptionLineChart({
  points,
  height,
  delay,
}: {
  points: LinePoint[];
  height: number;
  delay: number;
}) {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const reveal = useEntranceProgress(delay, 1400);
  const { maxValue, ticks } = axisTicks(
    Math.max(...points.map((point) => point.kwh)),
  );
  const plotWidth = Math.max(width - axisWidth, 0);
  const step =
    points.length > 1 ? (plotWidth - edgePadding * 2) / (points.length - 1) : 0;
  const coordinates = points.map((point, index) => ({
    x: points.length > 1 ? edgePadding + index * step : plotWidth / 2,
    y: height - (point.kwh / maxValue) * height,
  }));
  const line = smoothPath(coordinates);
  const area = coordinates.length
    ? `${line} L${coordinates[coordinates.length - 1].x} ${height} L${coordinates[0].x} ${height} Z`
    : "";
  const shown = activeIndex ?? points.length - 1;
  const active = coordinates[shown];

  return (
    <View
      style={styles.chart}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <View style={styles.body}>
        <View style={[styles.axis, { height }]}>
          {ticks.map((tick) => (
            <Text
              key={tick}
              style={[
                styles.axisLabel,
                { top: height - (tick / maxValue) * height - 9 },
              ]}
            >
              {axisFormatter.format(tick)}
            </Text>
          ))}
        </View>
        {plotWidth > 0 && (
          <View style={{ width: plotWidth, height }}>
            {ticks.map((tick) => (
              <View
                key={tick}
                style={[
                  styles.gridLine,
                  { top: height - (tick / maxValue) * height },
                ]}
              />
            ))}
            <View
              style={[styles.reveal, { width: plotWidth * reveal, height }]}
            >
              <Svg width={plotWidth} height={height}>
                <Defs>
                  <LinearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
                    <Stop
                      offset="0"
                      stopColor={colors.leafLight}
                      stopOpacity={0.5}
                    />
                    <Stop
                      offset="1"
                      stopColor={colors.leafLight}
                      stopOpacity={0.04}
                    />
                  </LinearGradient>
                </Defs>
                <Path d={area} fill="url(#lineArea)" />
                <Path
                  d={line}
                  stroke={colors.primary}
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                />
                {active && (
                  <>
                    <Line
                      x1={active.x}
                      y1={active.y}
                      x2={active.x}
                      y2={height}
                      stroke={colors.primary}
                      strokeOpacity={0.25}
                      strokeWidth={1.5}
                    />
                    <Circle
                      cx={active.x}
                      cy={active.y}
                      r={9}
                      fill={colors.surface}
                      stroke={colors.primary}
                      strokeWidth={3}
                    />
                    <Circle
                      cx={active.x}
                      cy={active.y}
                      r={4}
                      fill={colors.primary}
                    />
                  </>
                )}
              </Svg>
            </View>
            {active && reveal === 1 && (
              <View
                pointerEvents="none"
                style={[
                  styles.tooltip,
                  {
                    left: Math.min(
                      Math.max(active.x - tooltipWidth / 2, 0),
                      plotWidth - tooltipWidth,
                    ),
                    top: Math.max(active.y - 74, -spacing.xl),
                  },
                ]}
              >
                <Text style={styles.tooltipDetail}>{points[shown].detail}</Text>
                <Text style={styles.tooltipValue}>
                  {formatKwh(points[shown].kwh)} kWh
                </Text>
              </View>
            )}
            <View style={styles.hitAreas}>
              {points.map((point, index) => (
                <Pressable
                  key={point.key}
                  accessibilityRole="button"
                  accessibilityLabel={`${point.detail}: ${formatKwh(point.kwh)} kWh`}
                  onHoverIn={() => setActiveIndex(index)}
                  onHoverOut={() => setActiveIndex(null)}
                  onPress={() => setActiveIndex(index)}
                  style={styles.hitArea}
                />
              ))}
            </View>
          </View>
        )}
      </View>
      {plotWidth > 0 && (
        <View style={[styles.labels, { marginStart: axisWidth }]}>
          {points.map((point, index) => (
            <Text
              key={point.key}
              numberOfLines={1}
              style={[styles.xLabel, { left: coordinates[index].x - 40 }]}
            >
              {point.label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    paddingTop: spacing.xxl,
  },
  body: {
    flexDirection: "row",
  },
  axis: {
    width: axisWidth,
  },
  axisLabel: {
    position: "absolute",
    left: 0,
    ...typography.caption,
    color: colors.text,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  reveal: {
    overflow: "hidden",
  },
  tooltip: {
    position: "absolute",
    width: tooltipWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.small,
    backgroundColor: colors.surface,
    boxShadow: "0 6px 20px rgba(23, 35, 27, 0.14)",
  },
  tooltipDetail: {
    ...typography.small,
    fontSize: 13,
    color: colors.textMuted,
  },
  tooltipValue: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  hitAreas: {
    ...StyleSheet.absoluteFill,
    flexDirection: "row",
  },
  hitArea: {
    flex: 1,
    outlineWidth: 0,
  },
  labels: {
    height: 28,
    marginTop: spacing.sm,
  },
  xLabel: {
    position: "absolute",
    width: 80,
    textAlign: "center",
    ...typography.caption,
    color: colors.text,
  },
});
