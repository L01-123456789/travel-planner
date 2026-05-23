import { useMemo, useState } from "react";
import {
  type GestureResponderEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
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

const BUDGET_MIN = 0;
const BUDGET_MAX = 10000000;
const STEP = 100000;

export default function TripInfoScreen() {
  const [trackWidth, setTrackWidth] = useState(0);
  const [budget, setBudget] = useState(5000000);
  const [counts, setCounts] = useState({
    adult: 2,
    child: 0,
    infant: 0,
    pet: 0,
  });

  const formatter = useMemo(() => new Intl.NumberFormat("vi-VN"), []);

  const updateBudgetFromX = (locationX: number) => {
    if (!trackWidth) {
      return;
    }
    const ratio = Math.min(1, Math.max(0, locationX / trackWidth));
    const rawValue = BUDGET_MIN + (BUDGET_MAX - BUDGET_MIN) * ratio;
    const steppedValue = Math.round(rawValue / STEP) * STEP;
    setBudget(steppedValue);
  };

  const handleTrackPress = (event: GestureResponderEvent) => {
    updateBudgetFromX(event.nativeEvent.locationX);
  };

  const handleTrackMove = (event: GestureResponderEvent) => {
    updateBudgetFromX(event.nativeEvent.locationX);
  };

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const progressRatio = (budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN);

  const adjustCount = (key: keyof typeof counts, delta: number) => {
    setCounts((current) => ({
      ...current,
      [key]: Math.max(0, current[key] + delta),
    }));
  };

  const groups = [
    {
      key: "adult",
      title: "Người lớn",
      subtitle: "Từ 13 tuổi trở lên",
      icon: "person",
    },
    {
      key: "child",
      title: "Trẻ em",
      subtitle: "Độ tuổi 2 - 12",
      icon: "happy",
    },
    {
      key: "infant",
      title: "Em bé",
      subtitle: "Dưới 2 tuổi",
      icon: "sparkles",
    },
    {
      key: "pet",
      title: "Thú cưng",
      subtitle: "Mang theo bạn bốn chân",
      icon: "paw",
    },
  ] as const;

  const router = useRouter();

  const handleContinue = () => {
    updateOnboardingState({
      people: { ...counts },
      budget,
    });
    router.push("/travel-dates");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={ACCENT} />
          </Pressable>
          <Text style={styles.headerTitle}>Thông tin chuyến đi</Text>
          <Pressable style={styles.iconButton}>
            <Ionicons name="notifications" size={20} color={ACCENT} />
          </Pressable>
        </View>

        <View style={styles.progressRow}>
          <View style={styles.progressDots}>
            {[0, 1, 2, 3].map((item) => (
              <View
                key={item}
                style={[
                  styles.progressDot,
                  item === 0 ? styles.progressDotActive : null,
                ]}
              />
            ))}
          </View>
          <Text style={styles.stepText}>Bước 1/4</Text>
        </View>

        <Text style={styles.title}>Bạn sẽ đi cùng ai?</Text>
        <Text style={styles.subtitle}>
          Hãy cho chúng tôi biết số lượng thành viên để chuẩn bị lịch trình phù
          hợp nhất.
        </Text>

        {groups.map((item) => (
          <View key={item.key} style={styles.countCard}>
            <View style={styles.countInfo}>
              <Text style={styles.countTitle}>{item.title}</Text>
              <Text style={styles.countSubtitle}>{item.subtitle}</Text>
            </View>
            <View style={styles.countControls}>
              <Pressable
                style={styles.countButton}
                onPress={() => adjustCount(item.key, -1)}
              >
                <Ionicons name="remove" size={16} color={TEXT_MUTED} />
              </Pressable>
              <Text style={styles.countValue}>{counts[item.key]}</Text>
              <Pressable
                style={[styles.countButton, styles.countButtonActive]}
                onPress={() => adjustCount(item.key, 1)}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Ngân sách cho chuyến đi</Text>
        <Text style={styles.subtitle}>
          Ước tính số tiền tối đa bạn muốn chi tiêu cho mỗi người.
        </Text>

        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <View>
              <Text style={styles.budgetLabel}>MỨC</Text>
              <Text style={styles.budgetLabel}>NGÂN</Text>
              <Text style={styles.budgetLabel}>SÁCH</Text>
            </View>
            <Text style={styles.budgetValue}>
              {formatter.format(budget)}
              <Text style={styles.budgetUnit}> VND</Text>
            </Text>
          </View>

          <View
            style={styles.sliderTrack}
            onLayout={handleTrackLayout}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleTrackPress}
            onResponderMove={handleTrackMove}
          >
            <View
              style={[styles.sliderFill, { width: `${progressRatio * 100}%` }]}
            />
            <View
              style={[
                styles.sliderThumb,
                { left: Math.max(0, trackWidth * progressRatio - 10) },
              ]}
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>0</Text>
            <Text style={styles.sliderLabelText}>10.000.000+</Text>
          </View>
        </View>

        <Text style={styles.helperText}>Hoặc nhập số tiền cụ thể</Text>
        <View style={styles.inputShell}>
          <TextInput
            value={formatter.format(budget)}
            onChangeText={(value) => {
              const raw = Number(value.replace(/[^0-9]/g, ""));
              if (!Number.isNaN(raw)) {
                setBudget(Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, raw)));
              }
            }}
            keyboardType="numeric"
            placeholder="Ví dụ: 7.500.000"
            placeholderTextColor={TEXT_MUTED}
            style={styles.input}
          />
          <Text style={styles.inputUnit}>VND</Text>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={18} color={ACCENT} />
          <Text style={styles.infoText}>
            Hệ thống sẽ tự động lọc các địa điểm lưu trú và hoạt động phù hợp
            với số lượng thành viên và ngân sách bạn đề ra.
          </Text>
        </View>

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
    marginBottom: 10,
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
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  progressDots: {
    flexDirection: "row",
    gap: 6,
  },
  progressDot: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DDE3E1",
  },
  progressDotActive: {
    backgroundColor: ACCENT,
  },
  stepText: {
    fontSize: 12,
    color: TEXT_MUTED,
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
    marginBottom: 14,
  },
  countCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  countInfo: {
    flex: 1,
  },
  countTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  countSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  countControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  countButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F1F3F4",
    alignItems: "center",
    justifyContent: "center",
  },
  countButtonActive: {
    backgroundColor: ACCENT,
  },
  countValue: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_DARK,
    minWidth: 18,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
    marginTop: 10,
    marginBottom: 6,
  },
  budgetCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  budgetLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: "600",
    letterSpacing: 1.2,
  },
  budgetValue: {
    fontSize: 26,
    fontWeight: "700",
    color: ACCENT,
  },
  budgetUnit: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "600",
  },
  sliderTrack: {
    height: 6,
    backgroundColor: "#E1E6E3",
    borderRadius: 3,
    position: "relative",
  },
  sliderFill: {
    height: 6,
    backgroundColor: ACCENT,
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    top: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: ACCENT,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sliderLabelText: {
    fontSize: 11,
    color: TEXT_MUTED,
  },
  helperText: {
    fontSize: 13,
    color: TEXT_DARK,
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 8,
  },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: TEXT_DARK,
  },
  inputUnit: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "600",
  },
  infoBox: {
    marginTop: 14,
    backgroundColor: "#E8F4EE",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#CDE5D7",
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    color: ACCENT,
    fontSize: 12,
    lineHeight: 18,
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
