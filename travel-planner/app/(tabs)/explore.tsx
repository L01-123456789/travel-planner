import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {
  resetOnboardingState,
  updateOnboardingState,
} from "@/lib/onboarding-store";

const ACCENT = "#0B7D4E";
const TEXT_DARK = "#1F2328";
const TEXT_MUTED = "#6F7780";
const SURFACE = "#FFFFFF";
const BORDER = "#E4E8EB";

export default function ExploreScreen() {
  const router = useRouter();
  const [selectedDestination, setSelectedDestination] = useState<string | null>(
    null,
  );

  const destinations = [
    { id: "hanoi", name: "Hà Nội", meta: "3 ngày · Ẩm thực" },
    { id: "danang", name: "Đà Nẵng", meta: "4 ngày · Biển" },
    { id: "dalat", name: "Đà Lạt", meta: "3 ngày · Nghỉ dưỡng" },
    { id: "hochiminh", name: "TP. Hồ Chí Minh", meta: "2 ngày · Thành phố" },
  ];

  const handleCreateTrip = () => {
    if (!selectedDestination) {
      return;
    }
    resetOnboardingState();
    const chosen = destinations.find((item) => item.id === selectedDestination);
    if (chosen) {
      updateOnboardingState({
        destination: { id: chosen.id, name: chosen.name },
      });
    }
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
        <Pressable
          style={[
            styles.primaryButton,
            !selectedDestination ? styles.primaryButtonDisabled : null,
          ]}
          onPress={handleCreateTrip}
          disabled={!selectedDestination}
        >
          <Text style={styles.primaryButtonText}>Tạo chuyến đi</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
        <View style={styles.suggestionRow}>
          {destinations.map((item) => {
            const isSelected = selectedDestination === item.id;
            return (
              <Pressable
                key={item.id}
                style={[
                  styles.suggestionCard,
                  isSelected ? styles.suggestionCardSelected : null,
                ]}
                onPress={() => setSelectedDestination(item.id)}
              >
                <View style={styles.suggestionHeader}>
                  <Text style={styles.suggestionTitle}>{item.name}</Text>
                  {isSelected ? (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  ) : null}
                </View>
                <Text style={styles.suggestionMeta}>{item.meta}</Text>
              </Pressable>
            );
          })}
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
  primaryButtonDisabled: {
    opacity: 0.6,
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
    flexWrap: "wrap",
    gap: 12,
  },
  suggestionCard: {
    width: "48%",
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    gap: 6,
  },
  suggestionCardSelected: {
    borderColor: ACCENT,
    backgroundColor: "#F1F8F4",
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  selectedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
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
