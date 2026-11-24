import { Check } from "lucide-react-native";
import { useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { colors, radii, spacing, typography } from "../../design-system/tokens";
import { useEntranceSpring } from "../../hooks/useEntranceAnimation";
import type { ScreenRect } from "../../types/layout";

type PopupMenuProps<T extends string> = {
  anchor: ScreenRect | null;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

export function PopupMenu<T extends string>({
  anchor,
  options,
  selected,
  onSelect,
  onClose,
}: PopupMenuProps<T>) {
  return (
    <Modal
      transparent
      visible={anchor !== null}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityLabel="Cerrar menú"
        style={StyleSheet.absoluteFill}
        onPress={onClose}
      />
      {anchor && (
        <MenuPanel
          anchor={anchor}
          options={options}
          selected={selected}
          onSelect={(value) => {
            onSelect(value);
            onClose();
          }}
        />
      )}
    </Modal>
  );
}

function MenuPanel<T extends string>({
  anchor,
  options,
  selected,
  onSelect,
}: Omit<PopupMenuProps<T>, "anchor" | "onClose"> & { anchor: ScreenRect }) {
  const { width: windowWidth } = useWindowDimensions();
  const appear = useEntranceSpring(0);
  const [hovered, setHovered] = useState<T | null>(null);

  return (
    <Animated.View
      accessibilityRole="menu"
      style={[
        styles.panel,
        {
          top: anchor.y + anchor.height + spacing.sm,
          right: Math.max(windowWidth - anchor.x - anchor.width, spacing.sm),
          minWidth: Math.max(anchor.width, 200),
          opacity: appear.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: "clamp",
          }),
          transform: [
            {
              scale: appear.interpolate({
                inputRange: [0, 1],
                outputRange: [0.92, 1],
              }),
            },
          ],
        },
      ]}
    >
      {options.map((option, index) => {
        const isSelected = option.value === selected;
        return (
          <View key={option.value}>
            {index > 0 && <View style={styles.separator} />}
            <Pressable
              accessibilityRole="menuitem"
              accessibilityState={{ checked: isSelected }}
              onPress={() => onSelect(option.value)}
              onHoverIn={() => setHovered(option.value)}
              onHoverOut={() => setHovered(null)}
              style={({ pressed }) => [
                styles.item,
                (pressed || hovered === option.value) && styles.itemActive,
              ]}
            >
              <View style={styles.check}>
                {isSelected && (
                  <Check size={18} color={colors.primary} strokeWidth={3} />
                )}
              </View>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    paddingVertical: spacing.xs,
    borderRadius: radii.medium,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: "0 12px 32px rgba(23, 35, 27, 0.16)",
    transformOrigin: "top right",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 44,
    paddingStart: spacing.md,
    paddingEnd: spacing.lg,
    marginHorizontal: spacing.xs,
    borderRadius: radii.small - 4,
    outlineWidth: 0,
  },
  itemActive: {
    backgroundColor: colors.primaryLight,
  },
  check: {
    width: 20,
    alignItems: "center",
  },
  label: {
    ...typography.body,
    color: colors.text,
  },
  labelSelected: {
    fontWeight: "600",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginStart: 44,
    backgroundColor: colors.border,
  },
});
