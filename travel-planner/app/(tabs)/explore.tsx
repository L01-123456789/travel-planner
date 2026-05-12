import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { apiRequestJson } from "@/lib/api";
import { getUserIdFromAccessToken } from "@/lib/jwt";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
};

type ApiResponse<T> = {
  message: string;
  data: T;
};

export default function TabTwoScreen() {
  const borderColor = useThemeColor({}, "icon");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  const defaultBaseUrl = useMemo(
    () =>
      process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1",
    [],
  );

  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const userId = useMemo(
    () => (token ? getUserIdFromAccessToken(token) : null),
    [token],
  );
  const [userIdOverride, setUserIdOverride] = useState("");

  const [placeId, setPlaceId] = useState("");
  const [placeJson, setPlaceJson] = useState<string>("");

  const [tripName, setTripName] = useState("My Trip");
  const [startDate, setStartDate] = useState("2026-05-12");
  const [endDate, setEndDate] = useState("2026-05-14");
  const [budget, setBudget] = useState("5000000");
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">API Demo</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Backend base URL</ThemedText>
        <ThemedText>
          If you run backend locally, replace localhost with your PC IP (or
          emulator host).
        </ThemedText>
        <TextInput
          value={baseUrl}
          onChangeText={setBaseUrl}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="http://localhost:8080/api/v1"
          placeholderTextColor={borderColor}
          style={[
            styles.input,
            { borderColor, color: textColor, backgroundColor },
          ]}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Auth</ThemedText>
        <TextInput
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="username"
          placeholderTextColor={borderColor}
          style={[
            styles.input,
            { borderColor, color: textColor, backgroundColor },
          ]}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="password"
          placeholderTextColor={borderColor}
          style={[
            styles.input,
            { borderColor, color: textColor, backgroundColor },
          ]}
        />

        <ThemedView style={styles.row}>
          <Pressable
            style={[styles.button, { borderColor }]}
            onPress={async () => {
              try {
                const res = await apiRequestJson<ApiResponse<TokenResponse>>(
                  baseUrl,
                  "/auth/login",
                  {
                    method: "POST",
                    json: { username, password },
                  },
                  "auth.login",
                );
                setToken(res.data.access_token);
                setCreatedTripId(null);
                Alert.alert(
                  "Login ok",
                  `userId: ${getUserIdFromAccessToken(res.data.access_token) ?? "unknown"}`,
                );
              } catch (e) {
                Alert.alert("Login failed", String(e));
              }
            }}
          >
            <ThemedText type="defaultSemiBold">Login</ThemedText>
          </Pressable>

          <Pressable
            style={[styles.button, { borderColor }]}
            onPress={async () => {
              try {
                const res = await apiRequestJson<ApiResponse<TokenResponse>>(
                  baseUrl,
                  "/auth/register",
                  {
                    method: "POST",
                    json: {
                      first_name: "Demo",
                      last_name: "User",
                      email: `${username}@example.com`,
                      username,
                      password,
                    },
                  },
                  "auth.register",
                );
                setToken(res.data.access_token);
                setCreatedTripId(null);
                Alert.alert(
                  "Register ok",
                  `userId: ${getUserIdFromAccessToken(res.data.access_token) ?? "unknown"}`,
                );
              } catch (e) {
                Alert.alert("Register failed", String(e));
              }
            }}
          >
            <ThemedText type="defaultSemiBold">Register</ThemedText>
          </Pressable>
        </ThemedView>

        <ThemedText>
          Token:{" "}
          <ThemedText type="defaultSemiBold">
            {token ? "set" : "not set"}
          </ThemedText>
        </ThemedText>
        <ThemedText>
          userId (decoded):{" "}
          <ThemedText type="defaultSemiBold">{userId ?? "—"}</ThemedText>
        </ThemedText>

        <TextInput
          value={userIdOverride}
          onChangeText={setUserIdOverride}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="user_id override (optional)"
          placeholderTextColor={borderColor}
          style={[
            styles.input,
            { borderColor, color: textColor, backgroundColor },
          ]}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Explore place by ID</ThemedText>
        <TextInput
          value={placeId}
          onChangeText={setPlaceId}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="place id (UUID)"
          placeholderTextColor={borderColor}
          style={[
            styles.input,
            { borderColor, color: textColor, backgroundColor },
          ]}
        />
        <Pressable
          style={[styles.button, { borderColor }]}
          onPress={async () => {
            try {
              const place = await apiRequestJson<unknown>(
                baseUrl,
                `/explore/place/${encodeURIComponent(placeId)}`,
                { method: "GET" },
                "explore.place.getById",
              );
              setPlaceJson(JSON.stringify(place, null, 2));
              Alert.alert("Fetched", "Place loaded");
            } catch (e) {
              setPlaceJson("");
              Alert.alert("Fetch failed", String(e));
            }
          }}
        >
          <ThemedText type="defaultSemiBold">Fetch place</ThemedText>
        </Pressable>
        {placeJson ? (
          <ThemedText style={styles.mono}>{placeJson}</ThemedText>
        ) : (
          <ThemedText>
            Tip: you need an existing place_id from your DB.
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Create a trip (demo)</ThemedText>
        <ThemedText>
          This endpoint requires Bearer token and a user_id in body (backend
          design).
        </ThemedText>
        <TextInput
          value={tripName}
          onChangeText={setTripName}
          placeholder="trip name"
          placeholderTextColor={borderColor}
          style={[
            styles.input,
            { borderColor, color: textColor, backgroundColor },
          ]}
        />
        <TextInput
          value={startDate}
          onChangeText={setStartDate}
          placeholder="start date (YYYY-MM-DD)"
          placeholderTextColor={borderColor}
          style={[
            styles.input,
            { borderColor, color: textColor, backgroundColor },
          ]}
        />
        <TextInput
          value={endDate}
          onChangeText={setEndDate}
          placeholder="end date (YYYY-MM-DD)"
          placeholderTextColor={borderColor}
          style={[
            styles.input,
            { borderColor, color: textColor, backgroundColor },
          ]}
        />
        <TextInput
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
          placeholder="budget"
          placeholderTextColor={borderColor}
          style={[
            styles.input,
            { borderColor, color: textColor, backgroundColor },
          ]}
        />
        <Pressable
          style={[styles.button, { borderColor }]}
          onPress={async () => {
            if (!token) {
              Alert.alert("Missing token", "Login/Register first");
              return;
            }
            const resolvedUserId =
              userIdOverride.trim() || getUserIdFromAccessToken(token) || "";
            if (!resolvedUserId) {
              Alert.alert(
                "Missing userId",
                "Enter user_id override (or use a token that includes it)",
              );
              return;
            }

            try {
              const res = await apiRequestJson<ApiResponse<string>>(
                baseUrl,
                "/trip/create",
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  json: {
                    trip_id: "",
                    user_id: resolvedUserId,
                    trip_name: tripName,
                    start_date: `${startDate}T00:00:00.000Z`,
                    end_date: `${endDate}T00:00:00.000Z`,
                    budget: Number(budget) || 0,
                    trip_status: "planning",
                    trip_destinations: [],
                  },
                },
                "trip.create",
              );
              setCreatedTripId(res.data);
              Alert.alert("Trip created", `tripId: ${res.data}`);
            } catch (e) {
              Alert.alert("Create trip failed", String(e));
            }
          }}
        >
          <ThemedText type="defaultSemiBold">Create trip</ThemedText>
        </Pressable>
        <ThemedText>
          Created tripId:{" "}
          <ThemedText type="defaultSemiBold">{createdTripId ?? "—"}</ThemedText>
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  section: {
    gap: 8,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  mono: {
    fontFamily: "monospace",
  },
});
