import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import * as Sentry from "@sentry/react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  sendDefaultPii: false,
  enabled: true,
});

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="interests" options={{ headerShown: false }} />
        <Stack.Screen name="trip-info" options={{ headerShown: false }} />
        <Stack.Screen name="travel-dates" options={{ headerShown: false }} />
        <Stack.Screen name="plan-creating" options={{ headerShown: false }} />
        <Stack.Screen name="plan-budget" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default Sentry.wrap(RootLayout);
