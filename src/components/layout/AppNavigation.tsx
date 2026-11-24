import { TabTrigger, type TabTriggerSlotProps } from "expo-router/ui";
import {
  ChartNoAxesColumn,
  FileText,
  House,
  LogOut,
  type LucideIcon,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  colors,
  layout,
  radii,
  spacing,
  typography,
} from "../../design-system/tokens";
import { useAuth } from "../../features/auth/AuthProvider";
import { Logo } from "../ui/Logo";

type NavItem = {
  name: string;
  href: string;
  label: string;
  icon: LucideIcon;
  inBottomBar: boolean;
};

export const navItems: NavItem[] = [
  { name: "index", href: "/", label: "Inicio", icon: House, inBottomBar: true },
  {
    name: "statistics",
    href: "/statistics",
    label: "Estadísticas",
    icon: ChartNoAxesColumn,
    inBottomBar: true,
  },
  {
    name: "bills",
    href: "/bills",
    label: "Facturas",
    icon: FileText,
    inBottomBar: true,
  },
];

type NavButtonProps = Omit<TabTriggerSlotProps, "ref"> & {
  item: NavItem;
};

function SidebarButton({ item, isFocused, ...props }: NavButtonProps) {
  const Icon = item.icon;
  const color = isFocused ? colors.primaryDark : colors.text;

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={[styles.sidebarButton, isFocused && styles.sidebarButtonActive]}
    >
      <Icon
        size={22}
        color={color}
        fill={isFocused && item.name === "index" ? color : "none"}
      />
      <Text style={[styles.sidebarLabel, isFocused && styles.labelActive]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

function BottomBarButton({ item, isFocused, ...props }: NavButtonProps) {
  const Icon = item.icon;
  const color = isFocused ? colors.primary : colors.text;

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={styles.bottomButton}
    >
      <Icon
        size={24}
        color={color}
        fill={isFocused && item.name === "index" ? color : "none"}
      />
      <Text
        numberOfLines={1}
        style={[styles.bottomLabel, isFocused && styles.bottomLabelActive]}
      >
        {item.label}
      </Text>
      {isFocused && <View style={styles.bottomIndicator} />}
    </Pressable>
  );
}

export function Sidebar() {
  const { state, signOut } = useAuth();

  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarLogo}>
        <Logo size={22} />
      </View>
      <View style={styles.sidebarList}>
        {navItems.map((item) => (
          <TabTrigger key={item.name} name={item.name} asChild>
            <SidebarButton item={item} />
          </TabTrigger>
        ))}
      </View>
      <View style={styles.account}>
        {state.status === "signedIn" && (
          <Text numberOfLines={1} style={styles.accountEmail}>
            {state.account.email}
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          onPress={signOut}
          style={({ pressed }) => [
            styles.sidebarButton,
            pressed && styles.sidebarButtonActive,
          ]}
        >
          <LogOut size={22} color={colors.text} />
          <Text style={styles.sidebarLabel}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function BottomBar() {
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.bottomBar,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}
    >
      {navItems
        .filter((item) => item.inBottomBar)
        .map((item) => (
          <TabTrigger key={item.name} name={item.name} asChild>
            <BottomBarButton item={item} />
          </TabTrigger>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: layout.sidebarWidth,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderRightWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sidebarLogo: {
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  account: {
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  accountEmail: {
    ...typography.small,
    fontSize: 13,
    paddingHorizontal: spacing.lg,
    color: colors.textMuted,
  },
  sidebarList: {
    flex: 1,
    gap: spacing.xs,
  },
  sidebarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.medium,
  },
  sidebarButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  sidebarLabel: {
    ...typography.caption,
    fontSize: 16,
    color: colors.text,
  },
  labelActive: {
    fontWeight: "700",
    color: colors.primaryDark,
  },
  bottomBar: {
    flexDirection: "row",
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  bottomButton: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 52,
    paddingTop: spacing.xs,
  },
  bottomLabel: {
    ...typography.small,
    color: colors.text,
  },
  bottomLabelActive: {
    fontWeight: "700",
    color: colors.primary,
  },
  bottomIndicator: {
    width: "70%",
    height: 3,
    marginTop: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
});
