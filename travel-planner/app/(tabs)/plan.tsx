import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ActivityDetailSheet } from "@/components/activity-detail-sheet";
import { HintSolveSheet } from "@/components/hint-solve-sheet";
import * as mockApi from "@/lib/api-client";
import type { Activity, Trip } from "@/lib/types";

const ACCENT = "#0B7D4E";
const ACCENT_SOFT = "#E7F2ED";
const TEXT_DARK = "#1F2328";
const TEXT_MUTED = "#6B737B";
const SURFACE = "#FFFFFF";
const BACKGROUND = "#F7F8F7";
const BORDER = "#E4E8EB";

const HERO_IMAGE = require("@/assets/images/2.png");
const PLACE_IMAGE = require("@/assets/images/1.png");

const SEGMENT_ICONS: Record<string, keyof typeof import("@expo/vector-icons").Ionicons.glyphMap> = {
  morning: "sunny",
  afternoon: "leaf",
  evening: "moon",
};

const formatCurrency = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

const formatShortDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const d = `${date.getDate()}`.padStart(2, "0");
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${d} Thg ${m}`;
};

export default function PlanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tripId?: string }>();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedLocator, setSelectedLocator] = useState<
    { dayIndex: number; segmentIndex: number; activityIndex: number } | null
  >(null);
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      let target: Trip | null = null;
      if (params.tripId) {
        target = await mockApi.getTripById(params.tripId);
      }
      if (!target) {
        const list = await mockApi.getMyTrips();
        target = list[0] ?? (await mockApi.createTrip());
      }
      if (alive) {
        setTrip(target);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [params.tripId]);

  const dayPlans = trip?.planByDay ?? [];
  const activePlan = dayPlans[selectedDayIndex];

  const totalBudget = trip?.budget ?? 0;
  const spentBudget = useMemo(() => Math.round(totalBudget * 0.66), [totalBudget]);
  const remainingBudget = Math.max(0, totalBudget - spentBudget);
  const progressRatio = totalBudget ? spentBudget / totalBudget : 0;

  const destinationName = trip?.destinationName ?? "Chuyến đi";
  const dateLabel =
    dayPlans.length > 0
      ? `${formatShortDate(dayPlans[0].date)} - ${formatShortDate(dayPlans[dayPlans.length - 1].date)}`
      : "";

  const openActivity = (
    activity: Activity,
    dayIndex: number,
    segmentIndex: number,
    activityIndex: number,
  ) => {
    setSelectedActivity(activity);
    setSelectedLocator({ dayIndex, segmentIndex, activityIndex });
  };

  const closeActivity = () => {
    setSelectedActivity(null);
    setSelectedLocator(null);
  };

  const handleSaveTrip = async () => {
    if (!trip) return;
    await mockApi.saveTrip(trip.tripId);
    Alert.alert("Đã lưu", "Chuyến đi của bạn đã được lưu vào hồ sơ.");
    setTrip({ ...trip, status: "saved" });
  };

  const handlePickReplacement = async (replacement: Activity) => {
    if (!trip || !selectedLocator) return;
    const { dayIndex, segmentIndex, activityIndex } = selectedLocator;
    const original = trip.planByDay[dayIndex].segments[segmentIndex].activities[activityIndex];
    const merged: Activity = {
      ...replacement,
      startTime: original.startTime,
      endTime: original.endTime,
    };
    await mockApi.updateActivity(trip.tripId, dayIndex, segmentIndex, activityIndex, merged);
    const next: Trip = {
      ...trip,
      planByDay: trip.planByDay.map((d, di) =>
        di !== dayIndex
          ? d
          : {
              ...d,
              segments: d.segments.map((s, si) =>
                si !== segmentIndex
                  ? s
                  : {
                      ...s,
                      activities: s.activities.map((a, ai) => (ai === activityIndex ? merged : a)),
                    },
              ),
            },
      ),
    };
    setTrip(next);
    setHintOpen(false);
    closeActivity();
    Alert.alert("Đã cập nhật", "Hoạt động đã được thay thế bằng gợi ý mới.");
  };

  if (loading || !trip) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Đang tải hành trình...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={TEXT_DARK} />
          </Pressable>
          <Text style={styles.brandText}>The Curator</Text>
          <Pressable style={styles.saveBtn} onPress={handleSaveTrip}>
            <Ionicons
              name={trip.status === "saved" ? "bookmark" : "bookmark-outline"}
              size={16}
              color={trip.status === "saved" ? ACCENT : TEXT_DARK}
            />
            <Text style={[styles.saveBtnText, trip.status === "saved" ? { color: ACCENT } : null]}>
              {trip.status === "saved" ? "Đã lưu" : "Lưu"}
            </Text>
          </Pressable>
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
          onPress={() => router.push({ pathname: "/plan-budget", params: { tripId: trip.tripId } })}
        >
          <View style={styles.budgetHeader}>
            <View>
              <Text style={styles.budgetLabel}>TỔNG NGÂN SÁCH</Text>
              <Text style={styles.budgetValue}>{formatCurrency(totalBudget)}đ</Text>
            </View>
            <View style={styles.budgetBadge}>
              <Text style={styles.budgetBadgeText}>Hợp lý</Text>
            </View>
          </View>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetRowLabel}>Đã chi tiêu</Text>
            <Text style={styles.budgetRowValue}>{formatCurrency(spentBudget)}đ</Text>
          </View>
          <View style={styles.budgetTrack}>
            <View style={[styles.budgetFill, { width: `${progressRatio * 100}%` }]} />
          </View>
          <View style={styles.budgetFoot}>
            <Text style={styles.budgetFootText}>{Math.round(progressRatio * 100)}% HOÀN THÀNH</Text>
            <Text style={styles.budgetFootText}>CÒN LẠI: {formatCurrency(remainingBudget)}đ</Text>
          </View>
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabs}>
          {dayPlans.map((day, index) => {
            const isActive = index === selectedDayIndex;
            return (
              <Pressable
                key={day.date}
                style={[styles.dayPill, isActive ? styles.dayPillActive : null]}
                onPress={() => setSelectedDayIndex(index)}
              >
                <Text style={[styles.dayPillText, isActive ? styles.dayPillTextActive : null]}>
                  {day.dayTitle}
                </Text>
                <Text style={[styles.dayPillSub, isActive ? styles.dayPillTextActive : null]}>
                  {formatShortDate(day.date)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activePlan?.dailyTips ? (
          <View style={styles.tipsCard}>
            <Ionicons name="bulb" size={14} color={ACCENT} />
            <Text style={styles.tipsText}>{activePlan.dailyTips}</Text>
          </View>
        ) : null}

        {activePlan?.segments.map((segment, segmentIndex) => (
          <View key={`${selectedDayIndex}-${segment.timeOfDay}`} style={styles.segmentBlock}>
            <View style={styles.segmentHeader}>
              <View style={styles.segmentIcon}>
                <Ionicons name={SEGMENT_ICONS[segment.timeOfDay] ?? "sunny"} size={14} color={ACCENT} />
              </View>
              <Text style={styles.segmentLabel}>
                {segment.label} · {segment.timeLabel}
              </Text>
            </View>

            {segment.activities.map((activity, activityIndex) => (
              <Pressable
                key={activity.activityId ?? `${activity.id}-${activityIndex}`}
                style={styles.activityCard}
                onPress={() => openActivity(activity, selectedDayIndex, segmentIndex, activityIndex)}
              >
                <View style={styles.activityHeader}>
                  <View style={styles.typeBadge}>
                    <Ionicons
                      name={
                        activity.type === "restaurant"
                          ? "restaurant"
                          : activity.type === "accommodation"
                          ? "bed"
                          : "compass"
                      }
                      size={11}
                      color={ACCENT}
                    />
                    <Text style={styles.typeBadgeText}>
                      {activity.type === "restaurant"
                        ? "Ẩm thực"
                        : activity.type === "accommodation"
                        ? "Lưu trú"
                        : "Tham quan"}
                    </Text>
                  </View>
                  {activity.rating ? (
                    <View style={styles.miniRating}>
                      <Ionicons name="star" size={11} color="#F5A524" />
                      <Text style={styles.miniRatingText}>{activity.rating.toFixed(1)}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.activityTitle}>{activity.name}</Text>
                <Text style={styles.activityDesc} numberOfLines={2}>
                  {activity.description}
                </Text>
                <View style={styles.activityMetaRow}>
                  <Ionicons name="location" size={12} color={TEXT_MUTED} />
                  <Text style={styles.activityMeta} numberOfLines={1}>
                    {activity.address}
                  </Text>
                </View>
                <View style={styles.activityFoot}>
                  <View style={styles.activityFootLeft}>
                    <Ionicons name="time" size={12} color={TEXT_MUTED} />
                    <Text style={styles.activityFootText}>
                      {activity.startTime}
                      {activity.endTime ? ` - ${activity.endTime}` : ""}
                    </Text>
                  </View>
                  <Text style={styles.activityPrice}>
                    {activity.priceEstimate > 0
                      ? `${formatCurrency(activity.priceEstimate)}đ`
                      : "Miễn phí"}
                  </Text>
                </View>
                <View style={styles.activityMediaRow}>
                  <Image source={PLACE_IMAGE} style={styles.activityHero} contentFit="cover" />
                </View>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      <ActivityDetailSheet
        visible={!!selectedActivity}
        activity={selectedActivity}
        onClose={closeActivity}
        onRequestHintSolve={() => setHintOpen(true)}
      />

      <HintSolveSheet
        visible={hintOpen}
        activity={selectedActivity}
        preference={trip.preference}
        onClose={() => setHintOpen(false)}
        onPick={handlePickReplacement}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: TEXT_MUTED, fontSize: 14 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 80, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: "#EEF1F0",
    alignItems: "center", justifyContent: "center",
  },
  brandText: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  saveBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    backgroundColor: "#EEF1F0",
  },
  saveBtnText: { fontSize: 13, fontWeight: "700", color: TEXT_DARK },
  heroCard: { borderRadius: 18, overflow: "hidden", minHeight: 170 },
  heroImage: { width: "100%", height: "100%", position: "absolute" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  heroContent: { padding: 16, marginTop: 8, gap: 6 },
  heroLabel: { color: "#FFFFFF", fontSize: 11, letterSpacing: 1.1, fontWeight: "700" },
  heroTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroMetaText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  budgetCard: { backgroundColor: SURFACE, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: BORDER, gap: 12 },
  budgetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  budgetLabel: { color: TEXT_MUTED, fontSize: 11, fontWeight: "700", letterSpacing: 1.1 },
  budgetValue: { fontSize: 22, fontWeight: "700", color: TEXT_DARK, marginTop: 6 },
  budgetBadge: { backgroundColor: ACCENT_SOFT, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  budgetBadgeText: { color: ACCENT, fontWeight: "700", fontSize: 12 },
  budgetRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  budgetRowLabel: { color: TEXT_MUTED, fontSize: 12 },
  budgetRowValue: { color: TEXT_DARK, fontSize: 14, fontWeight: "700" },
  budgetTrack: { height: 8, backgroundColor: "#EEF1F0", borderRadius: 999, overflow: "hidden" },
  budgetFill: { height: "100%", backgroundColor: ACCENT, borderRadius: 999 },
  budgetFoot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  budgetFootText: { fontSize: 11, color: TEXT_MUTED, fontWeight: "600" },
  dayTabs: { gap: 10, paddingVertical: 4 },
  dayPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: "#E9ECEB", minWidth: 90, alignItems: "center" },
  dayPillActive: { backgroundColor: ACCENT },
  dayPillText: { fontSize: 13, fontWeight: "700", color: TEXT_MUTED },
  dayPillSub: { fontSize: 10, fontWeight: "600", color: TEXT_MUTED, marginTop: 2 },
  dayPillTextActive: { color: "#FFFFFF" },
  tipsCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: ACCENT_SOFT, padding: 10, borderRadius: 12,
  },
  tipsText: { flex: 1, fontSize: 12, color: TEXT_DARK },
  segmentBlock: { gap: 10 },
  segmentHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  segmentIcon: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: ACCENT_SOFT,
    alignItems: "center", justifyContent: "center",
  },
  segmentLabel: { fontSize: 12, fontWeight: "700", color: TEXT_MUTED, letterSpacing: 1 },
  activityCard: {
    backgroundColor: SURFACE, borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: BORDER, gap: 8,
  },
  activityHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  typeBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
    backgroundColor: ACCENT_SOFT,
  },
  typeBadgeText: { fontSize: 10, fontWeight: "700", color: ACCENT, letterSpacing: 0.6 },
  miniRating: { flexDirection: "row", alignItems: "center", gap: 3 },
  miniRatingText: { fontSize: 11, fontWeight: "700", color: TEXT_DARK },
  activityTitle: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  activityDesc: { fontSize: 12, color: TEXT_MUTED, lineHeight: 17 },
  activityMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  activityMeta: { fontSize: 11, color: TEXT_MUTED, flex: 1 },
  activityFoot: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 8, borderTopWidth: 1, borderTopColor: BORDER,
  },
  activityFootLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  activityFootText: { fontSize: 11, color: TEXT_MUTED, fontWeight: "600" },
  activityPrice: { fontSize: 13, fontWeight: "700", color: ACCENT },
  activityMediaRow: { flexDirection: "row", gap: 10 },
  activityHero: { flex: 1, height: 120, borderRadius: 14 },
});
