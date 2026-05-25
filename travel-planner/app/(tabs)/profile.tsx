import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import * as mockApi from "@/lib/api-client";
import * as authStore from "@/lib/auth-store";
import type { Trip, User } from "@/lib/types";

const ACCENT = "#0B7D4E";
const ACCENT_SOFT = "#E7F2ED";
const TEXT_DARK = "#1F2328";
const TEXT_MUTED = "#6B737B";
const SURFACE = "#FFFFFF";
const BACKGROUND = "#F7F8F7";
const BORDER = "#E4E8EB";

const formatShortDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${`${d.getDate()}`.padStart(2, "0")}/${`${d.getMonth() + 1}`.padStart(2, "0")}`;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(authStore.getUser());
  const [trips, setTrips] = useState<Trip[]>([]);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => authStore.subscribe(setUser), []);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      mockApi.getMyTrips().then((list) => {
        if (alive) setTrips(list);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : "Du khách";

  const handleSignOut = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          authStore.signOut();
          router.replace("/sign-in");
        },
      },
    ]);
  };

  const savedTrips = trips.filter((t) => t.status === "saved");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{user?.email ?? "Chưa đăng nhập"}</Text>
          </View>
          <Pressable style={styles.editBtn}>
            <Ionicons name="create-outline" size={16} color={ACCENT} />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{trips.length}</Text>
            <Text style={styles.statLabel}>Hành trình</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{savedTrips.length}</Text>
            <Text style={styles.statLabel}>Đã lưu</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {trips.reduce((sum, t) => sum + t.planByDay.length, 0)}
            </Text>
            <Text style={styles.statLabel}>Ngày</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chuyến đi đã lưu</Text>
          {savedTrips.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="bookmark-outline" size={28} color={TEXT_MUTED} />
              <Text style={styles.emptyText}>Chưa có chuyến đi nào được lưu</Text>
              <Pressable
                style={styles.emptyCta}
                onPress={() => router.push("/(tabs)/explore")}
              >
                <Text style={styles.emptyCtaText}>Khám phá ngay</Text>
              </Pressable>
            </View>
          ) : (
            savedTrips.map((trip) => (
              <Pressable
                key={trip.tripId}
                style={styles.tripCard}
                onPress={() =>
                  router.push({ pathname: "/(tabs)/plan", params: { tripId: trip.tripId } })
                }
              >
                <View style={styles.tripIcon}>
                  <Ionicons name="map" size={18} color={ACCENT} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tripName}>{trip.tripName}</Text>
                  <Text style={styles.tripMeta}>
                    {formatShortDate(trip.startDate)} - {formatShortDate(trip.endDate)} · {trip.planByDay.length} ngày
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={TEXT_MUTED} />
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <View style={styles.row}>
            <Ionicons name="notifications-outline" size={18} color={TEXT_DARK} />
            <Text style={styles.rowLabel}>Thông báo</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: ACCENT, false: "#D0D5D9" }}
            />
          </View>
          <Pressable style={styles.row}>
            <Ionicons name="language-outline" size={18} color={TEXT_DARK} />
            <Text style={styles.rowLabel}>Ngôn ngữ</Text>
            <Text style={styles.rowValue}>Tiếng Việt</Text>
          </Pressable>
          <Pressable style={styles.row}>
            <Ionicons name="shield-checkmark-outline" size={18} color={TEXT_DARK} />
            <Text style={styles.rowLabel}>Bảo mật</Text>
            <Ionicons name="chevron-forward" size={16} color={TEXT_MUTED} />
          </Pressable>
          <Pressable style={styles.row}>
            <Ionicons name="help-circle-outline" size={18} color={TEXT_DARK} />
            <Text style={styles.rowLabel}>Trợ giúp</Text>
            <Ionicons name="chevron-forward" size={16} color={TEXT_MUTED} />
          </Pressable>
        </View>

        <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color="#D92D20" />
          <Text style={styles.signOutText}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  content: { padding: 20, gap: 18, paddingBottom: 60 },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 16, borderRadius: 18, backgroundColor: SURFACE,
    borderWidth: 1, borderColor: BORDER,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: ACCENT,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
  name: { fontSize: 18, fontWeight: "700", color: TEXT_DARK },
  email: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  editBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: ACCENT_SOFT,
    alignItems: "center", justifyContent: "center",
  },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, padding: 14, borderRadius: 14,
    backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
    alignItems: "center", gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: "700", color: TEXT_DARK },
  statLabel: { fontSize: 11, color: TEXT_MUTED, fontWeight: "600", letterSpacing: 0.6 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: TEXT_MUTED, letterSpacing: 1, textTransform: "uppercase" },
  empty: {
    alignItems: "center", padding: 22, borderRadius: 16,
    backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, gap: 10,
  },
  emptyText: { color: TEXT_MUTED, fontSize: 13 },
  emptyCta: {
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: ACCENT, borderRadius: 999,
  },
  emptyCtaText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  tripCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14,
    backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
  },
  tripIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: ACCENT_SOFT,
    alignItems: "center", justifyContent: "center",
  },
  tripName: { fontSize: 14, fontWeight: "700", color: TEXT_DARK },
  tripMeta: { fontSize: 11, color: TEXT_MUTED, marginTop: 2 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14,
    backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
  },
  rowLabel: { flex: 1, fontSize: 14, color: TEXT_DARK, fontWeight: "600" },
  rowValue: { fontSize: 12, color: TEXT_MUTED },
  signOutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#FECDCA",
    backgroundColor: "#FEF3F2",
  },
  signOutText: { color: "#D92D20", fontWeight: "700", fontSize: 14 },
});
