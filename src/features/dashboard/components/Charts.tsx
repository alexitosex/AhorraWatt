import { useState, type ReactNode } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

import {
  colors,
  radii,
  shadows,
  spacing,
  typography,
} from "../../../design-system/tokens";
import { FadeInView } from "../../../components/ui/FadeInView";
import {
  useEntranceProgress,
  useEntranceSpring,
} from "../../../hooks/useEntranceAnimation";
import { axisFormatter, axisTicks, smoothPath } from "../../../lib/chart";
import { formatKwh } from "../../../lib/format";

const ringSegments = 72;
const barStagger = 70;

function mixColors(from: string, to: string, amount: number) {
  const channels = [1, 3, 5].map((offset) => {
    const a = parseInt(from.slice(offset, offset + 2), 16);
    const b = parseInt(to.slice(offset, offset + 2), 16);
    return Math.round(a + (b - a) * amount)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${channels.join("")}`;
}

export function ProgressRing({
  size,
  progress,
  delay,
  children,
}: {
  size: number;
  progress: number;
  delay: number;
  children: ReactNode;
}) {
  const current = progress * useEntranceProgress(delay, 1300);
  const strokeWidth = size * 0.085;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const pointAt = (fraction: number) => {
    const angle = 2 * Math.PI * fraction - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };
  const start = pointAt(0);
  const end = pointAt(current);
  const endColor = mixColors(
    colors.primaryDark,
    colors.leafLight,
    current / progress,
  );

  // SVG has no conic gradient, so the arc is drawn as short segments that fade
  // from dark to light along the progress direction.
  const segments = Array.from({ length: ringSegments }, (_, index) => {
    const fromFraction = (index / ringSegments) * progress;
    const toFraction = Math.min(
      ((index + 1.2) / ringSegments) * progress,
      current,
    );
    const from = pointAt(fromFraction);
    const to = pointAt(toFraction);
    return {
      key: index,
      visible: fromFraction < current,
      d: `M${from.x} ${from.y} A${radius} ${radius} 0 0 1 ${to.x} ${to.y}`,
      color: mixColors(
        colors.primaryDark,
        colors.leafLight,
        index / ringSegments,
      ),
    };
  }).filter((segment) => segment.visible);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.ringTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments.map((segment) => (
          <Path
            key={segment.key}
            d={segment.d}
            stroke={segment.color}
            strokeWidth={strokeWidth}
            fill="none"
          />
        ))}
        {current > 0 && (
          <>
            <Circle
              cx={start.x}
              cy={start.y}
              r={strokeWidth / 2}
              fill={colors.primaryDark}
            />
            <Circle cx={end.x} cy={end.y} r={strokeWidth / 2} fill={endColor} />
          </>
        )}
      </Svg>
      <View style={styles.ringContent}>{children}</View>
    </View>
  );
}

export function AreaSparkline({
  values,
  height,
  delay,
}: {
  values: number[];
  height: number;
  delay: number;
}) {
  const [width, setWidth] = useState(0);
  const reveal = useEntranceProgress(delay, 1400);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const padding = 6;

  const points = values.map((value, index) => ({
    x: (index / (values.length - 1)) * width,
    y: padding + (1 - (value - min) / range) * (height - padding * 2),
  }));
  const line = smoothPath(points);
  const area = `${line} L${width} ${height} L0 ${height} Z`;

  return (
    <View
      style={{ height }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <View style={[styles.reveal, { width: width * reveal, height }]}>
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <Stop
                  offset="0"
                  stopColor={colors.leafLight}
                  stopOpacity={0.55}
                />
                <Stop
                  offset="1"
                  stopColor={colors.leafLight}
                  stopOpacity={0.06}
                />
              </LinearGradient>
            </Defs>
            <Path d={area} fill="url(#area)" />
            <Path
              d={line}
              stroke={colors.leaf}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
        </View>
      )}
    </View>
  );
}

type BarDatum = { key: string; label: string; name: string; kwh: number };

function Bar({
  width,
  height,
  color,
  delay,
}: {
  width: number;
  height: number;
  color: string;
  delay: number;
}) {
  const growth = useEntranceSpring(delay);

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          width,
          height,
          backgroundColor: color,
          transform: [{ scaleY: growth }],
        },
      ]}
    />
  );
}

export function ConsumptionBarChart({
  data,
  highlightedIndex,
  height,
  delay,
}: {
  data: BarDatum[];
  highlightedIndex: number;
  height: number;
  delay: number;
}) {
  const { maxValue, ticks } = axisTicks(
    Math.max(...data.map((day) => day.kwh)),
  );
  const barWidth = 42;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const activeIndex = hoveredIndex ?? highlightedIndex;
  const active = data[activeIndex];
  const tooltipDelay = hasInteracted
    ? 0
    : delay + data.length * barStagger + 150;

  const select = (index: number) => {
    setHoveredIndex(index);
    setHasInteracted(true);
  };

  return (
    <View style={styles.chart}>
      <View style={styles.chartBody}>
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
        <View style={styles.plot}>
          <View style={[styles.plotArea, { height }]}>
            {ticks.map((tick) => (
              <View
                key={tick}
                style={[
                  styles.gridLine,
                  { top: height - (tick / maxValue) * height },
                ]}
              />
            ))}
            <View style={styles.bars}>
              {data.map((day, index) => {
                const isActive = index === activeIndex;
                return (
                  <Pressable
                    key={day.key}
                    accessibilityRole="button"
                    accessibilityLabel={`${day.name}: ${formatKwh(day.kwh)} kWh`}
                    accessibilityState={{ selected: isActive }}
                    onHoverIn={() => select(index)}
                    onHoverOut={() => setHoveredIndex(null)}
                    onPress={() => select(index)}
                    style={[styles.barColumn, isActive && styles.activeColumn]}
                  >
                    {hoveredIndex === index && (
                      <View style={styles.hoverBand} />
                    )}
                    {isActive && (
                      <FadeInView
                        key={activeIndex}
                        delay={tooltipDelay}
                        style={styles.tooltip}
                      >
                        <View style={styles.tooltipBubble}>
                          {hoveredIndex !== null && (
                            <Text numberOfLines={1} style={styles.tooltipDay}>
                              {active.name}
                            </Text>
                          )}
                          <Text numberOfLines={1} style={styles.tooltipText}>
                            {formatKwh(active.kwh)} kWh
                          </Text>
                        </View>
                        <View style={styles.tooltipArrow} />
                      </FadeInView>
                    )}
                    <Bar
                      width={barWidth}
                      height={(day.kwh / maxValue) * height}
                      color={isActive ? colors.primaryDark : colors.barMuted}
                      delay={delay + index * barStagger}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.labels}>
            {data.map((day) => (
              <Text key={day.key} style={styles.dayLabel}>
                {day.label}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ringContent: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  chart: {
    paddingTop: 44,
  },
  chartBody: {
    flexDirection: "row",
  },
  axis: {
    width: 44,
  },
  axisLabel: {
    position: "absolute",
    left: 0,
    ...typography.small,
    fontSize: 13,
    color: colors.text,
  },
  plot: {
    flex: 1,
  },
  plotArea: {
    justifyContent: "flex-end",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  bars: {
    ...StyleSheet.absoluteFill,
    flexDirection: "row",
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  activeColumn: {
    zIndex: 1,
  },
  hoverBand: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: spacing.xs,
    right: spacing.xs,
    borderRadius: radii.small,
    backgroundColor: colors.primaryLight,
  },
  bar: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    transformOrigin: "bottom",
  },
  reveal: {
    overflow: "hidden",
  },
  tooltip: {
    width: 88,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  tooltipBubble: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 13,
    backgroundColor: colors.primaryDark,
    ...shadows.raised,
  },
  tooltipDay: {
    ...typography.small,
    fontSize: 11,
    color: colors.primarySoft,
  },
  tooltipText: {
    ...typography.small,
    fontSize: 13,
    fontWeight: "700",
    color: colors.surface,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.primaryDark,
  },
  labels: {
    flexDirection: "row",
    marginTop: spacing.sm,
  },
  dayLabel: {
    flex: 1,
    textAlign: "center",
    ...typography.small,
    fontSize: 13,
    color: colors.text,
  },
});
