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

export default function SignInScreen() {
  const [email, setEmail] = useState("curator@editorial.com");
  const [password, setPassword] = useState("password");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const baseUrl = useMemo(
    () =>
      process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1",
    [],
  );

  const handleSignIn = async () => {
    if (AUTO_BYPASS_AUTH) {
      router.replace("/(tabs)");
      return;
    }

    if (!email || !password) {
      Alert.alert("Missing info", "Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiRequestJson(baseUrl, "/auth/login", {
        method: "POST",
        json: { username: email, password },
      });
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Sign in failed", String(error));
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
        <View style={styles.brandBlock}>
          <View style={styles.logoTile}>
            <Ionicons name="compass" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>The Travel Editorial</Text>
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Continue your curated journey.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View style={styles.inputShell}>
            <Ionicons name="mail" size={18} color={TEXT_MUTED} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="curator@editorial.com"
              placeholderTextColor={TEXT_MUTED}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>PASSWORD</Text>
            <Pressable>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>
          </View>
          <View style={styles.inputShell}>
            <Ionicons name="lock-closed" size={18} color={TEXT_MUTED} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              placeholder="Enter your password"
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
          style={[
            styles.primaryButton,
            isSubmitting ? styles.primaryButtonDisabled : null,
          ]}
          onPress={handleSignIn}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? "Signing In..." : "Sign In"}
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
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <Link href="/sign-up" asChild>
            <Pressable>
              <Text style={styles.footerLink}>Sign Up</Text>
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
    paddingTop: 28,
    paddingBottom: 40,
  },
  brandBlock: {
    alignItems: "center",
    gap: 12,
    marginBottom: 26,
  },
  logoTile: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 16,
    letterSpacing: 0.6,
    color: TEXT_DARK,
    fontWeight: "600",
  },
  title: {
    fontSize: 34,
    color: TEXT_DARK,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_MUTED,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "600",
    letterSpacing: 1.2,
  },
  forgotText: {
    fontSize: 12,
    color: ACCENT,
    fontWeight: "600",
  },
  inputShell: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  primaryButton: {
    marginTop: 10,
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
