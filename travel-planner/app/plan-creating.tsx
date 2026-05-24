import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import * as mockApi from "@/lib/mock-api";

const ACCENT = "#0B7D4E";
const TEXT_DARK = "#1F2328";
const TEXT_MUTED = "#6F7780";
const BACKGROUND = "#F7F8F7";
const SURFACE = "#FFFFFF";
const BORDER = "#E4E8EB";

const STEP_TARGET = 72;
const TOTAL_DURATION_MS = 4200;

export default function PlanCreatingScreen() {
  const [progress, setProgress] = useState(12);
  const router = useRouter();
  const tripIdRef = useRef<string | null>(null);

  const arcRotation = useMemo(() => `${progress * 3.6 - 90}deg`, [progress]);

  useEffect(() => {
    let cancelled = false;
    mockApi.createTrip().then((trip) => {
      if (!cancelled) tripIdRef.current = trip.tripId;
    });
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const ratio = Math.min(1, elapsed / TOTAL_DURATION_MS);
      const value = Math.round(12 + (STEP_TARGET - 12) * ratio);
      setProgress(value);
      if (ratio >= 1) {
        clearInterval(timer);
        setTimeout(() => {
          const id = tripIdRef.current;
          router.replace(
            id
              ? { pathname: "/(tabs)/plan", params: { tripId: id } }
              : "/(tabs)/plan",
          );
        }, 600);
      }
    }, 120);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="menu" size={20} color={ACCENT} />
          </Pressable>
          <Text style={styles.headerTitle}>The Curator</Text>
          <View style={styles.avatar} />
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressRing}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressArc,
                  { transform: [{ rotate: arcRotation }] },
                ]}
              />
            </View>
            <View style={styles.progressInner}>
              <Ionicons name="search" size={28} color={ACCENT} />
            </View>
          </View>
          <Text style={styles.progressValue}>{progress}%</Text>
        </View>

        <Text style={styles.title}>Đang kiến tạo hành trình của bạn</Text>
        <Text style={styles.subtitle}>
          Chuyên gia ảo của chúng tôi đang tuyển chọn những trải nghiệm tinh túy
          nhất cho chuyến đi của bạn.
        </Text>

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
          <View style={styles.statusBody}>
            <Text style={styles.statusTitle}>Tìm kiếm địa điểm phù hợp</Text>
            <Text style={styles.statusSubtitle}>
              Đã hoàn thành phân tích sở thích
            </Text>
          </View>
        </View>

        <View style={[styles.statusCard, styles.statusCardActive]}>
          <View style={[styles.statusIcon, styles.statusIconActive]}>
            <Ionicons name="time" size={16} color={ACCENT} />
          </View>
          <View style={styles.statusBody}>
            <Text style={styles.statusTitle}>Thiết lập lịch trình</Text>
            <Text style={[styles.statusSubtitle, styles.statusSubtitleActive]}>
              Đang tối ưu hóa thời gian di chuyển...
            </Text>
          </View>
        </View>

        <View style={styles.statusCardMuted}>
          <View style={styles.statusIconMuted}>
            <Ionicons name="bulb" size={16} color={TEXT_MUTED} />
          </View>
          <View style={styles.statusBody}>
            <Text style={styles.statusTitleMuted}>
              Gợi ý hữu ích cho chuyến đi
            </Text>
            <Text style={styles.statusSubtitle}>
              Sắp hoàn thiện các mẹo du lịch
            </Text>
          </View>
        </View>

        <View style={styles.bannerCard}>
          <View style={styles.bannerImage} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerLabel}>ĐIỂM ĐẾN NỔI BẬT</Text>
            <Text style={styles.bannerTitle}>Bangkok, Thái Lan</Text>
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFF4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#122B3E",
  },
  progressWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  progressRing: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 12,
    borderColor: "#E4E9E6",
    alignItems: "center",
    justifyContent: "center",
  },
  progressArc: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 12,
    borderColor: ACCENT,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    transform: [{ rotate: "-40deg" }],
  },
  progressInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  progressValue: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 20,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  statusCardActive: {
    borderColor: "#D3E4DC",
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  statusCardMuted: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F2F4F3",
    borderWidth: 1,
    borderColor: "#EDF0EF",
  },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  statusIconActive: {
    backgroundColor: "#E3F1EA",
  },
  statusIconMuted: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E6E9E7",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBody: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  statusTitleMuted: {
    fontSize: 14,
    fontWeight: "700",
    color: "#B0B5BA",
  },
  statusSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  statusSubtitleActive: {
    color: ACCENT,
  },
  bannerCard: {
    marginTop: 6,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#0E2337",
  },
  bannerImage: {
    height: 120,
    backgroundColor: "#18344A",
  },
  bannerContent: {
    padding: 16,
  },
  bannerLabel: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: "#C7D4E0",
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
