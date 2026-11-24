import type { TextStyle, ViewStyle } from "react-native";

export const colors = {
  primary: "#238347",
  primaryDark: "#176B37",
  primaryLight: "#E8F4E9",
  primarySoft: "#DCEEDA",
  leaf: "#3E9E4A",
  leafLight: "#7CC36F",
  barMuted: "#B7DDB0",
  ringTrack: "#DDEFDA",
  background: "#F7F9F7",
  surface: "#FFFFFF",
  surfaceMuted: "#EEF3EE",
  text: "#17231B",
  textMuted: "#53635A",
  border: "#DCE6DD",
  accent: "#F4BE35",
  accentDark: "#E2A812",
  warningText: "#8A5A00",
  tipBackground: "#FDF2D8",
  bulbBase: "#8E9893",
  error: "#C43D3D",
  errorSoft: "#FBE9E7",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radii = {
  small: 12,
  medium: 16,
  card: 22,
  pill: 999,
};

export const shadows = {
  card: { boxShadow: "0 6px 20px rgba(23, 35, 27, 0.06)" },
  raised: { boxShadow: "0 4px 12px rgba(23, 107, 55, 0.25)" },
} satisfies Record<string, ViewStyle>;

export const typography = {
  title: { fontSize: 36, fontWeight: "700" },
  heading: { fontSize: 22, fontWeight: "700" },
  cardTitle: { fontSize: 18, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 24 },
  label: { fontSize: 15, fontWeight: "600" },
  caption: { fontSize: 14 },
  small: { fontSize: 12 },
} satisfies Record<string, TextStyle>;

export const breakpoints = {
  tablet: 600,
  desktop: 1024,
};

export const layout = {
  sidebarWidth: 232,
  contentMaxWidth: 1200,
};
