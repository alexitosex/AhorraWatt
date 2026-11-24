import { StyleSheet, type ViewProps } from "react-native";

import { colors, radii, shadows, spacing } from "../../design-system/tokens";
import { FadeInView } from "./FadeInView";

type CardProps = ViewProps & {
  delay?: number;
};

export function Card({ style, delay, ...props }: CardProps) {
  return <FadeInView delay={delay} style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
});
