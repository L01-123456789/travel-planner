import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { resetOnboardingState } from "@/lib/onboarding-store";

const ACCENT = "#0B7D4E";
const TEXT_DARK = "#1F2328";
const TEXT_MUTED = "#6F7780";
const SURFACE = "#FFFFFF";
const BORDER = "#E4E8EB";

export default function ExploreScreen() {
  const router = useRouter();

  const handleCreateTrip = () => {
    resetOnboardingState();
    router.push("/trip-info");
  };
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Chuyến đi</Text>
        <Pressable style={styles.iconButton}>
          <Ionicons name="options" size={18} color={ACCENT} />
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bắt đầu hành trình mới</Text>
        <Text style={styles.cardSubtitle}>
          Chọn điểm đến và tuỳ chỉnh trải nghiệm phù hợp với bạn.
        </Text>
        <Pressable style={styles.primaryButton} onPress={handleCreateTrip}>
          <Text style={styles.primaryButtonText}>Tạo chuyến đi</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
        <View style={styles.suggestionRow}>
          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionTitle}>Hà Nội</Text>
            <Text style={styles.suggestionMeta}>3 ngày · Ẩm thực</Text>
          </View>
          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionTitle}>Đà Nẵng</Text>
            <Text style={styles.suggestionMeta}>4 ngày · Biển</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8F7",
  },
  content: {
    padding: 20,
    gap: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF4F1",
  },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  cardSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: ACCENT,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  suggestionRow: {
    flexDirection: "row",
    gap: 12,
  },
  suggestionCard: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    gap: 6,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  suggestionMeta: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
});
