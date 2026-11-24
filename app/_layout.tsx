import { StatusBar } from "expo-status-bar";
import { TabList, TabSlot, TabTrigger, Tabs } from "expo-router/ui";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import {
  BottomBar,
  Sidebar,
  navItems,
} from "../src/components/layout/AppNavigation";
import {
  breakpoints,
  colors,
  spacing,
  typography,
} from "../src/design-system/tokens";
import { AuthProvider, useAuth } from "../src/features/auth/AuthProvider";
import { AuthScreen } from "../src/features/auth/AuthScreen";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <View style={styles.root}>
        <AuthGate />
      </View>
    </AuthProvider>
  );
}

function AuthGate() {
  const { state } = useAuth();

  if (state.status === "loading") {
    return <ActivityIndicator color={colors.primary} style={styles.status} />;
  }
  if (state.status === "error") {
    return (
      <Text style={[styles.message, styles.status]}>
        No pudimos abrir tu sesión. Cierra y vuelve a abrir la app.
      </Text>
    );
  }
  if (state.status === "signedOut") {
    return <AuthScreen />;
  }
  return <AppTabs />;
}

function AppTabs() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= breakpoints.desktop;

  return (
    <Tabs style={[styles.root, isDesktop && styles.row]}>
      {isDesktop && <Sidebar />}
      <TabSlot style={styles.scene} />
      {!isDesktop && <BottomBar />}
      <TabList style={styles.hidden}>
        {navItems.map((item) => (
          <TabTrigger key={item.name} name={item.name} href={item.href} />
        ))}
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    userSelect: "none",
  },
  row: {
    flexDirection: "row",
  },
  scene: {
    flex: 1,
  },
  hidden: {
    display: "none",
  },
  status: {
    marginTop: spacing.xxxl,
  },
  message: {
    ...typography.body,
    textAlign: "center",
    color: colors.textMuted,
  },
});
