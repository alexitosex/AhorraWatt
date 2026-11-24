import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../design-system/tokens";

const logoMark = require("../../../assets/illustrations/logo-mark.svg");

type LogoProps = {
  size?: number;
};

export function Logo({ size = 24 }: LogoProps) {
  return (
    <View
      accessible
      accessibilityLabel="AhorraWatt"
      accessibilityRole="header"
      style={styles.logo}
    >
      <Image
        source={logoMark}
        contentFit="contain"
        style={{ width: size * 2.2, height: size * 2.2 }}
      />
      <Text style={[styles.wordmark, { fontSize: size }]}>
        Ahorra<Text style={styles.watt}>Watt</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    flexDirection: "row",
    alignItems: "center",
  },
  wordmark: {
    marginStart: -4,
    fontStyle: "italic",
    fontWeight: "800",
    color: colors.primary,
  },
  watt: {
    color: colors.accentDark,
  },
});
