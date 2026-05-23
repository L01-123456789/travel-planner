import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { getOnboardingState } from "@/lib/onboarding-store";

const ACCENT = "#0B7D4E";
const ACCENT_SOFT = "#E7F2ED";
const TEXT_DARK = "#1F2328";
const TEXT_MUTED = "#6B737B";
const SURFACE = "#FFFFFF";
const BACKGROUND = "#F7F8F7";
const BORDER = "#E4E8EB";

const HERO_IMAGE = require("@/assets/images/2.png");
const PLACE_IMAGE = require("@/assets/images/1.png");

type Activity = {
  id: string;
  type: "place" | "restaurant" | "accommodation";
  name: string;
  startTime: string;
  endTime?: string;
  description: string;
  address: string;
  priceEstimate: number;
  imageUrls: number[];
};

type Segment = {
  timeOfDay: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  timeLabel: string;
  activities: Activity[];
};

type DayPlan = {
  date: string;
  dayTitle: string;
  segments: Segment[];
};

const DEFAULT_SEGMENTS: Segment[] = [
  {
    timeOfDay: "morning",
    label: "SÁNG SỚM",
    icon: "sunny",
    timeLabel: "08:30",
    activities: [
      {
        id: "activity-1",
        type: "restaurant",
        name: "Phở Bát Đàn & Cà Phê Trứng",
        startTime: "08:30",
        description:
          "Khởi đầu ngày mới với hương vị truyền thống của phố cổ Hà Nội.",
        address: "49 Bát Đàn, Hoàn Kiếm, Hà Nội",
        priceEstimate: 120000,
        imageUrls: [PLACE_IMAGE],
      },
    ],
  },
  {
    timeOfDay: "afternoon",
    label: "BUỔI TRƯA",
    icon: "leaf",
    timeLabel: "14:00",
    activities: [
      {
        id: "activity-2",
        type: "place",
        name: "Bảo tàng Dân tộc học",
        startTime: "14:00",
        description:
          "Khám phá di sản văn hóa đặc sắc của 54 dân tộc anh em.",
        address: "Nguyễn Văn Huyên, Cầu Giấy",
        priceEstimate: 200000,
        imageUrls: [PLACE_IMAGE],
      },
    ],
  },
  {
    timeOfDay: "evening",
    label: "BUỔI TỐI",
    icon: "moon",
    timeLabel: "19:30",
    activities: [
      {
        id: "activity-3",
        type: "place",
        name: "Dạo quanh Hồ Gươm",
        startTime: "19:30",
        description: "Thưởng thức không khí Hà Nội về đêm và các góc phố cổ.",
        address: "Hàng Trống, Hoàn Kiếm",
        priceEstimate: 0,
        imageUrls: [PLACE_IMAGE, PLACE_IMAGE],
      },
    ],
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value);

const buildDateRange = (start: string, end: string) => {
  const result: string[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return result;
  }
  let current = new Date(startDate.getTime());
  while (current <= endDate) {
    result.push(current.toISOString().slice(0, 10));
    current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
  }
  return result;
};

const formatShortDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${day} Thg ${month}`;
};

export default function PlanScreen() {
  const router = useRouter();
  const onboarding = getOnboardingState();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );

  const dateRange = useMemo(
    () => buildDateRange(onboarding.dates.start, onboarding.dates.end),
    [onboarding.dates.end, onboarding.dates.start],
  );

  const dayPlans = useMemo<DayPlan[]>(() => {
    if (dateRange.length === 0) {
      return [];
    }
    return dateRange.map((date, index) => ({
      date,
      dayTitle: `Ngày ${index + 1}`,
      segments: DEFAULT_SEGMENTS,
    }));
  }, [dateRange]);

  const activePlan = dayPlans[selectedDayIndex];

  const totalBudget = onboarding.budget || 12500000;
  const spentBudget = Math.round(totalBudget * 0.66);
  const remainingBudget = Math.max(0, totalBudget - spentBudget);
  const progressRatio = totalBudget ? spentBudget / totalBudget : 0;

  const destinationName = onboarding.destination?.name ?? "Hà Nội Hoài Cổ";
  const dateLabel =
    dateRange.length > 0
      ? `${formatShortDate(dateRange[0])} - ${formatShortDate(
          dateRange[dateRange.length - 1],
        )}`
      : "15 Thg 10 - 18 Thg 10";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={TEXT_DARK} />
          </Pressable>
          <Text style={styles.brandText}>The Curator</Text>
          <View style={styles.avatar} />
        </View>

        <View style={styles.heroCard}>
          <Image source={HERO_IMAGE} style={styles.heroImage} contentFit="cover" />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>ĐIỂM ĐẾN</Text>
            <Text style={styles.heroTitle}>{destinationName}</Text>
            <View style={styles.heroMeta}>
              <Ionicons name="calendar" size={14} color="#FFFFFF" />
              <Text style={styles.heroMetaText}>{dateLabel}</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.budgetCard}
          onPress={() => router.push("/plan-budget")}
        >
          <View style={styles.budgetHeader}>
            <View>
              <Text style={styles.budgetLabel}>TỔNG NGÂN SÁCH</Text>
              <Text style={styles.budgetValue}>
                {formatCurrency(totalBudget)}đ
              </Text>
            </View>
            <View style={styles.budgetBadge}>
              <Text style={styles.budgetBadgeText}>Hợp lý</Text>
            </View>
          </View>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetRowLabel}>Đã chi tiêu</Text>
            <Text style={styles.budgetRowValue}>
              {formatCurrency(spentBudget)}đ
            </Text>
          </View>
          <View style={styles.budgetTrack}>
            <View
              style={[styles.budgetFill, { width: `${progressRatio * 100}%` }]}
            />
          </View>
          <View style={styles.budgetFoot}>
            <Text style={styles.budgetFootText}>
              {Math.round(progressRatio * 100)}% HOÀN THÀNH
            </Text>
            <Text style={styles.budgetFootText}>
              CÒN LẠI: {formatCurrency(remainingBudget)}đ
            </Text>
          </View>
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabs}
        >
          {dayPlans.map((day, index) => {
            const isActive = index === selectedDayIndex;
            return (
              <Pressable
                key={day.date}
                style={[styles.dayPill, isActive ? styles.dayPillActive : null]}
                onPress={() => setSelectedDayIndex(index)}
              >
                <Text
                  style={[
                    styles.dayPillText,
                    isActive ? styles.dayPillTextActive : null,
                  ]}
                >
                  {day.dayTitle}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activePlan?.segments.map((segment) => (
          <View key={segment.timeOfDay} style={styles.segmentBlock}>
            <View style={styles.segmentHeader}>
              <View style={styles.segmentIcon}>
                <Ionicons name={segment.icon} size={14} color={ACCENT} />
              </View>
              <Text style={styles.segmentLabel}>
                {segment.label} · {segment.timeLabel}
              </Text>
            </View>

            {segment.activities.map((activity) => (
              <Pressable
                key={activity.id}
                style={styles.activityCard}
                onPress={() => setSelectedActivity(activity)}
              >
                <View style={styles.activityBody}>
                  <Text style={styles.activityTitle}>{activity.name}</Text>
                  <View style={styles.activityMetaRow}>
                    <Ionicons
                      name="location"
                      size={12}
                      color={TEXT_MUTED}
                    />
                    <Text style={styles.activityMeta}>{activity.address}</Text>
                  </View>
                </View>
                <View style={styles.activityMediaRow}>
                  {activity.imageUrls.map((image, index) => (
                    <Image
                      key={`${activity.id}-${index}`}
                      source={image}
                      style={
                        index === 0
                          ? styles.activityHero
                          : styles.activityThumb
                      }
                      contentFit="cover"
                    />
                  ))}
                </View>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={!!selectedActivity}
        onRequestClose={() => setSelectedActivity(null)}
      >
        <View style={styles.detailBackdrop}>
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Chi tiết hoạt động</Text>
              <Pressable
                style={styles.detailClose}
                onPress={() => setSelectedActivity(null)}
              >
                <Ionicons name="close" size={16} color={TEXT_DARK} />
              </Pressable>
            </View>
            {selectedActivity ? (
              <>
                <Image
                  source={selectedActivity.imageUrls[0] ?? PLACE_IMAGE}
                  style={styles.detailImage}
                  contentFit="cover"
                />
                <Text style={styles.detailName}>{selectedActivity.name}</Text>
                <Text style={styles.detailTime}>
                  {selectedActivity.startTime}
                  {selectedActivity.endTime
                    ? ` - ${selectedActivity.endTime}`
                    : ""}
                </Text>
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={14} color={TEXT_MUTED} />
                  <Text style={styles.detailText}>
                    {selectedActivity.address}
                  </Text>
                </View>
                <Text style={styles.detailDescription}>
                  {selectedActivity.description}
                </Text>
                <View style={styles.detailPriceRow}>
                  <Text style={styles.detailPriceLabel}>Chi phí dự kiến</Text>
                  <Text style={styles.detailPriceValue}>
                    {formatCurrency(selectedActivity.priceEstimate)}đ
                  </Text>
                </View>
                <Pressable
                  style={styles.detailCta}
                  onPress={() => setSelectedActivity(null)}
                >
                  <Text style={styles.detailCtaText}>Hoàn tất</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
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
    paddingBottom: 80,
    gap: 18,
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
    backgroundColor: "#EEF1F0",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#102433",
  },
  heroCard: {
    borderRadius: 18,
    overflow: "hidden",
    minHeight: 170,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  heroContent: {
    padding: 16,
    marginTop: 8,
    gap: 6,
  },
  heroLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    letterSpacing: 1.1,
    fontWeight: "700",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroMetaText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  budgetCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 12,
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  budgetLabel: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  budgetValue: {
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_DARK,
    marginTop: 6,
  },
  budgetBadge: {
    backgroundColor: ACCENT_SOFT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  budgetBadgeText: {
    color: ACCENT,
    fontWeight: "700",
    fontSize: 12,
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  budgetRowLabel: {
    color: TEXT_MUTED,
    fontSize: 12,
  },
  budgetRowValue: {
    color: TEXT_DARK,
    fontSize: 14,
    fontWeight: "700",
  },
  budgetTrack: {
    height: 8,
    backgroundColor: "#EEF1F0",
    borderRadius: 999,
    overflow: "hidden",
  },
  budgetFill: {
    height: "100%",
    backgroundColor: ACCENT,
    borderRadius: 999,
  },
  budgetFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  budgetFootText: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: "600",
  },
  dayTabs: {
    gap: 10,
    paddingVertical: 4,
  },
  dayPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E9ECEB",
  },
  dayPillActive: {
    backgroundColor: ACCENT,
  },
  dayPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  dayPillTextActive: {
    color: "#FFFFFF",
  },
  segmentBlock: {
    gap: 10,
  },
  segmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  segmentIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT_SOFT,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_MUTED,
    letterSpacing: 1,
  },
  activityCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 12,
  },
  activityBody: {
    gap: 6,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  activityMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activityMeta: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  activityMediaRow: {
    flexDirection: "row",
    gap: 10,
  },
  activityHero: {
    flex: 1,
    height: 140,
    borderRadius: 16,
  },
  activityThumb: {
    width: 88,
    height: 88,
    borderRadius: 12,
  },
  detailBackdrop: {
    flex: 1,
    backgroundColor: "rgba(14, 20, 18, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  detailCard: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    padding: 18,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  detailClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EEF1F0",
    alignItems: "center",
    justifyContent: "center",
  },
  detailImage: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    marginBottom: 12,
  },
  detailName: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  detailTime: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  detailText: {
    fontSize: 12,
    color: TEXT_MUTED,
    flex: 1,
  },
  detailDescription: {
    fontSize: 13,
    color: TEXT_DARK,
    lineHeight: 18,
    marginTop: 10,
  },
  detailPriceRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailPriceLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  detailPriceValue: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  detailCta: {
    marginTop: 16,
    backgroundColor: ACCENT,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  detailCtaText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
