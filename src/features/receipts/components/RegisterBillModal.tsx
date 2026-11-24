import { Image } from "expo-image";
import {
  Calendar,
  FileText,
  ReceiptText,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type LayoutRectangle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  breakpoints,
  colors,
  radii,
  spacing,
  typography,
} from "../../../design-system/tokens";
import {
  formatDisplayDate,
  maskDateInput,
  todayIsoDate,
} from "../../../lib/dates";
import type { ScreenRect } from "../../../types/layout";
import {
  validateBillDraft,
  type BillDraft,
  type BillErrors,
  type BillInput,
  type ElectricityBill,
} from "../bill";

const receipt = require("../../../../assets/illustrations/receipt.svg");
const useNativeDriver = Platform.OS !== "web";

type RegisterBillModalProps = {
  origin: ScreenRect;
  title?: string;
  submitLabel?: string;
  existingBills: ElectricityBill[];
  onSubmit: (input: BillInput) => Promise<void>;
  onClose: () => void;
};

export function RegisterBillModal({
  origin,
  title = "Registrar consumo",
  submitLabel = "Registrar consumo",
  existingBills,
  onSubmit,
  onClose,
}: RegisterBillModalProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSheet = width < breakpoints.tablet;
  const [progress] = useState(() => new Animated.Value(0));
  const [panel, setPanel] = useState<LayoutRectangle | null>(null);
  const hasOpened = useRef(false);
  const isClosing = useRef(false);

  const [draft, setDraft] = useState<BillDraft>(() => ({
    // A new CFE period usually starts on the day the previous one ended.
    periodStart: existingBills[0]
      ? formatDisplayDate(existingBills[0].periodEnd)
      : "",
    periodEnd: "",
    consumptionKwh: "",
    amount: "",
  }));
  const [errors, setErrors] = useState<BillErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    if (!panel || hasOpened.current) {
      return;
    }
    hasOpened.current = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        if (reduced) {
          progress.setValue(1);
          return;
        }
        Animated.spring(progress, {
          toValue: 1,
          stiffness: 260,
          damping: 24,
          mass: 1,
          useNativeDriver,
        }).start();
      })
      .catch(() => progress.setValue(1));
  }, [panel, progress]);

  const close = () => {
    if (isClosing.current || isSaving) {
      return;
    }
    isClosing.current = true;
    Animated.timing(progress, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver,
    }).start(() => onClose());
  };

  const submit = async () => {
    if (isSaving) {
      return;
    }
    const result = validateBillDraft(draft, existingBills, todayIsoDate());
    setErrors(result.errors);
    if (!result.input) {
      return;
    }
    setIsSaving(true);
    setSaveFailed(false);
    try {
      await onSubmit(result.input);
    } catch {
      setIsSaving(false);
      setSaveFailed(true);
      return;
    }
    setIsSaving(false);
    close();
  };

  const update = (field: keyof BillDraft) => (value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const updateDate = (field: "periodStart" | "periodEnd") => (value: string) =>
    update(field)(maskDateInput(value));

  const panelMotion = panel
    ? isSheet
      ? {
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [panel.height, 0],
              }),
            },
          ],
        }
      : growFromOrigin(progress, origin, panel)
    : { opacity: 0 };

  return (
    <Modal
      transparent
      visible
      animationType="none"
      onRequestClose={() => close()}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.backdrop,
          {
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
              extrapolate: "clamp",
            }),
          },
        ]}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.layer, isSheet ? styles.layerSheet : styles.layerCenter]}
      >
        <Pressable
          accessibilityLabel="Cerrar"
          style={StyleSheet.absoluteFill}
          onPress={() => close()}
        />
        <Animated.View
          aria-modal
          accessibilityViewIsModal
          onLayout={(event) => setPanel(event.nativeEvent.layout)}
          style={[
            isSheet
              ? [styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]
              : [styles.dialog, { width: Math.min(640, width - spacing.xxl) }],
            panelMotion,
          ]}
        >
          {isSheet && <View style={styles.grabber} />}
          <View style={styles.header}>
            <FileText size={34} color={colors.primary} strokeWidth={2.2} />
            <View style={styles.headerText}>
              <Text
                accessibilityRole="header"
                style={[styles.title, !isSheet && styles.titleLarge]}
              >
                {title}
              </Text>
              <Text style={styles.subtitle}>
                Agrega los datos de tu recibo de luz.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              onPress={() => close()}
              style={styles.closeButton}
            >
              <X size={18} color={colors.text} strokeWidth={2.5} />
            </Pressable>
          </View>

          <View style={styles.body}>
            {!isSheet && (
              <View style={styles.illustration}>
                <Image
                  source={receipt}
                  contentFit="contain"
                  style={styles.illustrationImage}
                />
              </View>
            )}
            <View style={styles.fields}>
              <Field
                icon={Calendar}
                label="Periodo del recibo"
                error={errors.periodStart ?? errors.periodEnd}
              >
                <View style={styles.dateRow}>
                  <TextInput
                    value={draft.periodStart}
                    onChangeText={updateDate("periodStart")}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    maxLength={10}
                    accessibilityLabel="Inicio del periodo, día, mes y año"
                    style={[
                      styles.input,
                      styles.dateInput,
                      errors.periodStart && styles.inputError,
                    ]}
                  />
                  <Text style={styles.dateSeparator}>–</Text>
                  <TextInput
                    value={draft.periodEnd}
                    onChangeText={updateDate("periodEnd")}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    maxLength={10}
                    accessibilityLabel="Fin del periodo, día, mes y año"
                    style={[
                      styles.input,
                      styles.dateInput,
                      errors.periodEnd && styles.inputError,
                    ]}
                  />
                </View>
              </Field>
              <Field
                icon={Zap}
                label="Consumo (kWh)"
                error={errors.consumptionKwh}
              >
                <TextInput
                  value={draft.consumptionKwh}
                  onChangeText={update("consumptionKwh")}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  inputMode="decimal"
                  accessibilityLabel="Consumo en kWh"
                  style={[
                    styles.input,
                    errors.consumptionKwh && styles.inputError,
                  ]}
                />
              </Field>
              <Field
                icon={ReceiptText}
                label="Total a pagar"
                error={errors.amount}
              >
                <TextInput
                  value={draft.amount}
                  onChangeText={update("amount")}
                  placeholder="$0.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  inputMode="decimal"
                  accessibilityLabel="Total a pagar en pesos"
                  returnKeyType="done"
                  onSubmitEditing={submit}
                  style={[styles.input, errors.amount && styles.inputError]}
                />
              </Field>
            </View>
          </View>

          {saveFailed && (
            <Text accessibilityRole="alert" style={styles.errorText}>
              No pudimos guardar el recibo. Intenta de nuevo.
            </Text>
          )}
          <View style={[styles.footer, isSheet && styles.footerSheet]}>
            {!isSheet && (
              <Pressable
                accessibilityRole="button"
                onPress={() => close()}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.secondaryText}>Cancelar</Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ busy: isSaving, disabled: isSaving }}
              disabled={isSaving}
              onPress={submit}
              style={({ pressed }) => [
                styles.primaryButton,
                isSheet && styles.primaryButtonSheet,
                (pressed || isSaving) && styles.pressed,
              ]}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.primaryText}>{submitLabel}</Text>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Moves and scales the dialog from the button that opened it to its final
// centered position, so it reads as the button expanding into the dialog.
function growFromOrigin(
  progress: Animated.Value,
  origin: ScreenRect,
  panel: LayoutRectangle,
) {
  const startScale = Math.min(Math.max(origin.width / panel.width, 0.2), 1);
  return {
    opacity: progress.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 1, 1],
      extrapolate: "clamp" as const,
    }),
    transform: [
      {
        translateX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [
            origin.x + origin.width / 2 - (panel.x + panel.width / 2),
            0,
          ],
        }),
      },
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [
            origin.y + origin.height / 2 - (panel.y + panel.height / 2),
            0,
          ],
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [startScale, 1],
        }),
      },
    ],
  };
}

function Field({
  icon: Icon,
  label,
  error,
  children,
}: {
  icon: LucideIcon;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldIcon}>
        <Icon size={22} color={colors.text} />
      </View>
      <View style={styles.fieldControl}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {children}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(23, 35, 27, 0.35)",
  },
  layer: {
    flex: 1,
  },
  layerCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  layerSheet: {
    justifyContent: "flex-end",
  },
  dialog: {
    gap: spacing.xl,
    padding: spacing.xl,
    borderRadius: 28,
    backgroundColor: colors.surface,
    boxShadow: "0 24px 64px rgba(23, 35, 27, 0.22)",
  },
  sheet: {
    gap: spacing.lg,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.surface,
    boxShadow: "0 -8px 32px rgba(23, 35, 27, 0.12)",
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.heading,
    fontSize: 20,
    color: colors.text,
  },
  titleLarge: {
    fontSize: 24,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  body: {
    flexDirection: "row",
    gap: spacing.xl,
  },
  illustration: {
    alignItems: "center",
    justifyContent: "center",
    width: 190,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
  },
  illustrationImage: {
    width: 140,
    height: 150,
  },
  fields: {
    flex: 1,
    gap: spacing.md,
  },
  field: {
    flexDirection: "row",
    gap: spacing.md,
  },
  fieldIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    marginTop: 22,
    borderRadius: radii.small,
    backgroundColor: colors.surface,
    boxShadow: "0 2px 8px rgba(23, 35, 27, 0.08)",
  },
  fieldControl: {
    flex: 1,
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
    fontSize: 14,
    color: colors.text,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.small,
    backgroundColor: colors.surface,
    ...typography.body,
    fontSize: 17,
    color: colors.text,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dateInput: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.md,
  },
  dateSeparator: {
    ...typography.body,
    color: colors.textMuted,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.small,
    fontSize: 13,
    color: colors.error,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
  },
  footerSheet: {
    justifyContent: "center",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryText: {
    ...typography.label,
    fontSize: 17,
    color: colors.text,
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  primaryButtonSheet: {
    flex: 1,
    minHeight: 54,
  },
  primaryText: {
    ...typography.label,
    fontSize: 17,
    fontWeight: "700",
    color: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
});
