import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";

import { apiRequestJson } from "@/lib/api";

const ACCENT = "#0B7D4E";
const TEXT_DARK = "#1F2328";
const TEXT_MUTED = "#7B858F";
const SURFACE = "#FFFFFF";
const BACKGROUND = "#F6F8F7";
const BORDER = "#E5E8EB";
const AUTO_BYPASS_AUTH =
  (process.env.EXPO_PUBLIC_AUTH_BYPASS ?? "true") === "true";

export default function SignUpScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const baseUrl = useMemo(
    () =>
      process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1",
    [],
  );

  const splitName = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return { firstName: "", lastName: "" };
    }
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: "" };
    }
    return {
      firstName: parts.slice(0, -1).join(" "),
      lastName: parts[parts.length - 1],
    };
  };

  const handleSignUp = async () => {
    if (AUTO_BYPASS_AUTH) {
      router.replace("/(tabs)");
      return;
    }

    if (!fullName || !email || !password) {
      Alert.alert("Missing info", "Please fill in all fields.");
      return;
    }
    if (!acceptedTerms) {
      Alert.alert("Terms required", "Please accept the terms to continue.");
      return;
    }

    const { firstName, lastName } = splitName(fullName);
    const username = email.trim();

    try {
      setIsSubmitting(true);
      await apiRequestJson(baseUrl, "/auth/register", {
        method: "POST",
        json: {
          first_name: firstName,
          last_name: lastName,
          email,
          username,
          password,
        },
      });
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Sign up failed", String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Text style={styles.brandName}>The Travel Editorial</Text>
          <Pressable style={styles.closeButton}>
            <Ionicons name="close" size={20} color={TEXT_MUTED} />
          </Pressable>
        </View>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Join our community of global curators and start your journey.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>FULL NAME</Text>
          <View style={styles.inputShell}>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="John Doe"
              placeholderTextColor={TEXT_MUTED}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View style={styles.inputShell}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="curator@traveleditorial.com"
              placeholderTextColor={TEXT_MUTED}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.inputShell}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              placeholder="Create a password"
              placeholderTextColor={TEXT_MUTED}
              style={styles.input}
            />
            <Pressable
              onPress={() => setIsPasswordVisible((value) => !value)}
              hitSlop={8}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off" : "eye"}
                size={18}
                color={TEXT_MUTED}
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={styles.termsRow}
          onPress={() => setAcceptedTerms((value) => !value)}
        >
          <View
            style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
          >
            {acceptedTerms ? (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            ) : null}
          </View>
          <Text style={styles.termsText}>I agree to the </Text>
          <Pressable>
            <Text style={styles.termsLink}>Terms of Service</Text>
          </Pressable>
          <Text style={styles.termsText}> and </Text>
          <Pressable>
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Pressable>
          <Text style={styles.termsText}>.</Text>
        </Pressable>

        <Pressable
          style={[
            styles.primaryButton,
            isSubmitting ? styles.primaryButtonDisabled : null,
          ]}
          onPress={handleSignUp}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? "Creating..." : "Create Account"}
          </Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <Pressable style={styles.socialButton}>
            <Ionicons name="logo-google" size={18} color={TEXT_DARK} />
            <Text style={styles.socialText}>Google</Text>
          </Pressable>
          <Pressable style={[styles.socialButton, styles.socialButtonDark]}>
            <Ionicons name="logo-apple" size={18} color="#FFFFFF" />
            <Text style={[styles.socialText, styles.socialTextLight]}>
              Apple
            </Text>
          </Pressable>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/sign-in" asChild>
            <Pressable>
              <Text style={styles.footerLink}>Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  brandName: {
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: "600",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F3F4",
  },
  title: {
    fontSize: 32,
    color: TEXT_DARK,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_MUTED,
    marginTop: 8,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "600",
    letterSpacing: 1.2,
  },
  inputShell: {
    marginTop: 10,
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: TEXT_DARK,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 22,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  checkboxChecked: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  termsText: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  termsLink: {
    fontSize: 13,
    color: ACCENT,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: ACCENT,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: ACCENT,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },
  dividerText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "600",
  },
  socialRow: {
    flexDirection: "row",
    gap: 14,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    paddingVertical: 12,
  },
  socialButtonDark: {
    backgroundColor: "#171717",
    borderColor: "#171717",
  },
  socialText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  socialTextLight: {
    color: "#FFFFFF",
  },
  footerRow: {
    marginTop: 26,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  footerText: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  footerLink: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: "600",
  },
});
