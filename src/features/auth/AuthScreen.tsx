import { Image } from "expo-image";
import { Eye, EyeOff, Lock, Mail, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FadeInView } from "../../components/ui/FadeInView";
import { Logo } from "../../components/ui/Logo";
import {
  breakpoints,
  colors,
  radii,
  spacing,
  typography,
} from "../../design-system/tokens";
import { useAuth } from "./AuthProvider";
import type { CredentialErrors } from "./credentials";

const house = require("../../../assets/illustrations/house.webp");
const background = require("../../../assets/illustrations/auth-background.svg");
const compactBackground = require("../../../assets/illustrations/auth-background-compact.svg");

type Mode = "signIn" | "signUp";

const copy = {
  signIn: {
    title: "Inicia sesión",
    subtitle:
      "Accede a tu cuenta para gestionar tu consumo y ahorro de energía.",
    submit: "Iniciar sesión",
    switchPrompt: "¿No tienes una cuenta?",
    switchAction: "Regístrate",
  },
  signUp: {
    title: "Crea tu cuenta",
    subtitle: "Registra tus recibos de luz y sigue tu ahorro de energía.",
    submit: "Crear cuenta",
    switchPrompt: "¿Ya tienes una cuenta?",
    switchAction: "Inicia sesión",
  },
};

export function AuthScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= breakpoints.desktop - 124;
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<CredentialErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const text = copy[mode];

  const switchMode = () => {
    setMode(mode === "signIn" ? "signUp" : "signIn");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  const submit = async () => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      const result =
        mode === "signIn"
          ? await signIn(email, password)
          : await signUp(email, password, confirmPassword);
      setErrors(result);
    } catch {
      setErrors({ form: "Algo salió mal. Intenta de nuevo." });
    }
    setIsSubmitting(false);
  };

  const form = (
    <FadeInView key={mode} style={[styles.form, wide && styles.formWide]}>
      <Logo size={wide ? 30 : 26} />
      <View style={[styles.heading, !wide && styles.headingCentered]}>
        <Text
          accessibilityRole="header"
          aria-level={1}
          style={[styles.title, wide && styles.titleWide]}
        >
          {text.title}
        </Text>
        <Text
          style={[
            styles.subtitle,
            wide ? styles.subtitleWide : styles.centeredText,
          ]}
        >
          {text.subtitle}
        </Text>
      </View>
      <View style={styles.fields}>
        <AuthField
          icon={Mail}
          value={email}
          onChangeText={setEmail}
          placeholder="Correo electrónico"
          error={errors.email}
          keyboardType="email-address"
          autoComplete="email"
        />
        <AuthField
          icon={Lock}
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          error={errors.password}
          secure
          autoComplete={mode === "signIn" ? "current-password" : "new-password"}
          onSubmitEditing={mode === "signIn" ? submit : undefined}
        />
        {mode === "signUp" && (
          <AuthField
            icon={Lock}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirma tu contraseña"
            error={errors.confirmPassword}
            secure
            autoComplete="new-password"
            onSubmitEditing={submit}
          />
        )}
      </View>
      {errors.form && (
        <Text accessibilityRole="alert" style={styles.formError}>
          {errors.form}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: isSubmitting, disabled: isSubmitting }}
        disabled={isSubmitting}
        onPress={submit}
        style={({ pressed }) => [
          styles.submit,
          (pressed || isSubmitting) && styles.pressed,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.submitText}>{text.submit}</Text>
        )}
      </Pressable>
      <Text style={[styles.switchText, wide && styles.switchTextWide]}>
        {text.switchPrompt}{" "}
        <Text
          accessibilityRole="link"
          onPress={switchMode}
          style={styles.switchAction}
        >
          {text.switchAction}
        </Text>
      </Text>
    </FadeInView>
  );

  if (wide) {
    return (
      <View style={styles.wideScreen}>
        <Image
          source={background}
          contentFit="fill"
          style={StyleSheet.absoluteFill}
        />
        <ScrollView
          style={styles.wideFormColumn}
          contentContainerStyle={styles.wideFormContent}
        >
          {form}
        </ScrollView>
        <View style={styles.wideArt} pointerEvents="none">
          <Image source={house} contentFit="contain" style={styles.houseWide} />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Image
        source={compactBackground}
        contentFit="fill"
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.screen}
      >
        <ScrollView
          contentContainerStyle={styles.compactContent}
          keyboardShouldPersistTaps="handled"
        >
          {form}
          <Image
            source={house}
            contentFit="contain"
            style={styles.houseCompact}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AuthField({
  icon: Icon,
  value,
  onChangeText,
  placeholder,
  error,
  secure = false,
  keyboardType,
  autoComplete,
  onSubmitEditing,
}: {
  icon: LucideIcon;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  secure?: boolean;
  keyboardType?: "email-address";
  autoComplete: "email" | "current-password" | "new-password";
  onSubmitEditing?: () => void;
}) {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.fieldWrapper}>
      <View style={[styles.field, error && styles.fieldError]}>
        <Icon size={22} color={colors.text} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={placeholder}
          secureTextEntry={secure && hidden}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={autoComplete}
          onSubmitEditing={onSubmitEditing}
          style={styles.input}
        />
        {secure && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              hidden ? "Mostrar contraseña" : "Ocultar contraseña"
            }
            hitSlop={8}
            onPress={() => setHidden(!hidden)}
          >
            {hidden ? (
              <EyeOff size={22} color={colors.text} />
            ) : (
              <Eye size={22} color={colors.text} />
            )}
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.fieldErrorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  compactContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  wideScreen: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.background,
  },
  wideFormColumn: {
    flexGrow: 0,
    width: "44%",
  },
  wideFormContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingStart: "14%",
    paddingEnd: spacing.xxl,
    paddingVertical: spacing.xxl,
  },
  wideArt: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 0,
  },
  houseWide: {
    width: "94%",
    maxWidth: 820,
    aspectRatio: 1536 / 1024,
  },
  houseCompact: {
    alignSelf: "center",
    width: "112%",
    maxWidth: 460,
    aspectRatio: 1536 / 1024,
    marginTop: "auto",
  },
  form: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    alignItems: "center",
    gap: spacing.xl,
  },
  formWide: {
    maxWidth: 470,
    alignSelf: "flex-start",
    alignItems: "flex-start",
    gap: spacing.xxl,
  },
  subtitleWide: {
    maxWidth: 360,
    fontSize: 19,
    lineHeight: 28,
  },
  heading: {
    alignSelf: "stretch",
    gap: spacing.sm,
  },
  headingCentered: {
    alignItems: "center",
  },
  title: {
    ...typography.title,
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
  },
  titleWide: {
    fontSize: 48,
  },
  subtitle: {
    ...typography.body,
    fontSize: 17,
    color: colors.textMuted,
  },
  centeredText: {
    textAlign: "center",
  },
  fields: {
    alignSelf: "stretch",
    gap: spacing.md,
  },
  fieldWrapper: {
    gap: spacing.xs,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: colors.surface,
    boxShadow: "0 4px 14px rgba(23, 35, 27, 0.08)",
  },
  fieldError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: spacing.md,
    ...typography.body,
    fontSize: 17,
    color: colors.text,
    outlineWidth: 0,
  },
  fieldErrorText: {
    ...typography.small,
    fontSize: 13,
    color: colors.error,
  },
  formError: {
    ...typography.caption,
    color: colors.error,
    textAlign: "center",
  },
  submit: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    boxShadow: "0 6px 16px rgba(35, 131, 71, 0.3)",
    outlineWidth: 0,
  },
  submitText: {
    ...typography.label,
    fontSize: 18,
    fontWeight: "700",
    color: colors.surface,
  },
  pressed: {
    opacity: 0.75,
  },
  switchText: {
    alignSelf: "stretch",
    textAlign: "center",
    ...typography.body,
    fontSize: 15,
    color: colors.text,
  },
  switchTextWide: {
    fontSize: 18,
  },
  switchAction: {
    fontWeight: "700",
    color: colors.primary,
  },
});
