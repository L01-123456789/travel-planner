import { useMemo, useState } from "react";
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

import { updateOnboardingState } from "@/lib/onboarding-store";

const ACCENT = "#0B7D4E";
const TEXT_DARK = "#1F2328";
const TEXT_MUTED = "#6F7780";
const SURFACE = "#FFFFFF";
const BACKGROUND = "#F7F8F7";
const BORDER = "#E4E8EB";
const RANGE_BG = "#E5EFEA";

type DayCell = {
  key: string;
  label?: string;
  state?: "range" | "selected";
};

export default function TravelDatesScreen() {
  const [isFlexible, setIsFlexible] = useState(false);
  const router = useRouter();

  const octoberDays = useMemo(() => {
    const days: DayCell[] = [];
    const daysInMonth = 31;
    for (let i = 0; i < 7; i += 1) {
      days.push({ key: `oct-empty-${i}` });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const state =
        day >= 16 && day <= 18 ? "range" : day === 15 ? "selected" : undefined;
      days.push({ key: `oct-${day}`, label: String(day), state });
    }
    return days;
  }, []);

  const novemberDays = useMemo(() => {
    const days: DayCell[] = [];
    const daysInMonth = 30;
    for (let i = 0; i < 3; i += 1) {
      days.push({ key: `nov-empty-${i}` });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push({ key: `nov-${day}`, label: String(day) });
    }
    return days;
  }, []);

  const handleContinue = () => {
    updateOnboardingState({
      dates: {
        start: "2023-10-15",
        end: "2023-10-18",
        flexible: isFlexible,
      },
    });
    router.push("/interests");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="arrow-back" size={20} color={ACCENT} />
          </Pressable>
          <Text style={styles.headerTitle}>Chọn ngày đi</Text>
          <Pressable style={styles.iconButton}>
            <Ionicons name="help" size={18} color={ACCENT} />
          </Pressable>
        </View>

        <Text style={styles.title}>Bạn dự định đi lúc nào?</Text>
        <Text style={styles.subtitle}>
          Chọn ngày bắt đầu và kết thúc cho chuyến hành trình của bạn.
        </Text>

        <Text style={styles.monthTitle}>Tháng 10, 2023</Text>
        <View style={styles.weekRow}>
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((label) => (
            <Text key={label} style={styles.weekLabel}>
              {label}
            </Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {octoberDays.map((item) => {
            const isRange = item.state === "range";
            const isSelected = item.state === "selected";
            const isRangeStart = item.label === "16";
            const isRangeEnd = item.label === "18";
            return (
              <View key={item.key} style={styles.dayCell}>
                {isRange ? (
                  <View
                    style={[
                      styles.rangeHighlight,
                      isRangeStart ? styles.rangeStart : null,
                      isRangeEnd ? styles.rangeEnd : null,
                    ]}
                  />
                ) : null}
                {isSelected || isRangeEnd ? (
                  <View style={styles.selectedCircle}>
                    <Text style={styles.selectedText}>{item.label}</Text>
                  </View>
                ) : item.label ? (
                  <Text style={styles.dayText}>{item.label}</Text>
                ) : null}
              </View>
            );
          })}
        </View>

        <Text style={styles.monthTitle}>Tháng 11, 2023</Text>
        <View style={styles.weekRow}>
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((label) => (
            <Text key={label} style={styles.weekLabel}>
              {label}
            </Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {novemberDays.map((item) => (
            <View key={item.key} style={styles.dayCell}>
              {item.label ? (
                <Text style={styles.dayText}>{item.label}</Text>
              ) : null}
            </View>
          ))}
        </View>

        <Pressable
          style={styles.flexRow}
          onPress={() => setIsFlexible((value) => !value)}
        >
          <View
            style={[
              styles.flexCheckbox,
              isFlexible ? styles.flexCheckboxActive : null,
            ]}
          >
            {isFlexible ? (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            ) : null}
          </View>
          <Text style={styles.flexText}>Tôi chưa biết lịch trình cụ thể</Text>
        </Pressable>

        <Pressable style={styles.ctaButton} onPress={handleContinue}>
          <Text style={styles.ctaText}>Tiếp tục</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </Pressable>
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
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
    color: ACCENT,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_DARK,
    marginTop: 6,
    marginBottom: 8,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  weekLabel: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "600",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  dayText: {
    fontSize: 14,
    color: TEXT_DARK,
  },
  rangeHighlight: {
    position: "absolute",
    left: 6,
    right: 6,
    top: 8,
    bottom: 8,
    backgroundColor: RANGE_BG,
    borderRadius: 12,
  },
  rangeStart: {
    left: 12,
  },
  rangeEnd: {
    right: 12,
  },
  selectedCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  selectedText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  flexRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  flexCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SURFACE,
  },
  flexCheckboxActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  flexText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  ctaButton: {
    marginTop: 18,
    backgroundColor: ACCENT,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
