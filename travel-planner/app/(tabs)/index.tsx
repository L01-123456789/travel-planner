import { useCallback, useState } from "react";
import { Image } from "expo-image";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import * as Sentry from "@sentry/react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as mockApi from "@/lib/api-client";
import { resetOnboardingState } from "@/lib/onboarding-store";
import type { Trip } from "@/lib/types";

export default function HomeScreen() {
  const router = useRouter();
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      mockApi.getMyTrips().then((list) => {
        if (alive) setRecentTrips(list.slice(0, 5));
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const startNewTrip = () => {
    resetOnboardingState();
    router.push("/(tabs)/explore");
  };
  const textColor = "#0E1114";
  const mutedTextColor = "#7B858F";
  const cardColor = "#FFFFFF";
  const surfaceColor = "#FFFFFF";
  const borderColor = "#E6E8EB";
  const accent = "#1AA36C";

  const destinations = [
    {
      id: "hn",
      name: "Hà Nội",
      region: "Miền Bắc",
      rating: "4.8",
      image: require("@/assets/images/2.png"),
    },
    {
      id: "dn",
      name: "Đà Nẵng",
      region: "Miền Trung",
      rating: "4.7",
      image: require("@/assets/images/2.png"),
    },
  ];

  const categories = [
    { id: "food", label: "Ẩm thực", icon: "restaurant" },
    { id: "explore", label: "Khám phá", icon: "trail-sign" },
    { id: "stay", label: "Lưu trú", icon: "bed" },
    { id: "art", label: "Nghệ thuật", icon: "camera" },
  ];

  return (
    <ScrollView style={[styles.screen, { backgroundColor: surfaceColor }]}>
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { borderColor }]}>
          <IconSymbol size={18} name="magnifyingglass" color={mutedTextColor} />
          <TextInput
            placeholder="Bạn muốn đi đâu?"
            placeholderTextColor={mutedTextColor}
            style={[styles.searchInput, { color: textColor }]}
          />
        </View>
      </View>

      <View
        style={[styles.heroCard, { backgroundColor: cardColor }]}
        accessibilityRole="image"
      >
        <Image
          source={require("@/assets/images/1.png")}
          style={styles.heroImage}
          contentFit="cover"
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <ThemedText style={[styles.heroTitle, { color: "#FFFFFF" }]}>
            Tự chỉnh lịch trình thông minh
          </ThemedText>
          <ThemedText style={[styles.heroSubtitle, { color: "#DCE3E6" }]}>
            Lên kế hoạch hoàn hảo chỉ trong vài phút với AI.
          </ThemedText>
          <Pressable
            style={[styles.ctaButton, { backgroundColor: accent }]}
            onPress={() => {
              Sentry.captureMessage("Hero CTA clicked");
              startNewTrip();
            }}
          >
            <ThemedText style={styles.ctaText}>Khám phá ngay</ThemedText>
          </Pressable>
        </View>
      </View>

      {recentTrips.length > 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Chuyến đi gần đây
            </ThemedText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardRow}>
            {recentTrips.map((trip) => (
              <Pressable
                key={trip.tripId}
                style={[styles.recentTripCard, { backgroundColor: cardColor, borderColor }]}
                onPress={() =>
                  router.push({ pathname: "/(tabs)/plan", params: { tripId: trip.tripId } })
                }
              >
                <View style={[styles.tripStatusDot, { backgroundColor: trip.status === "saved" ? accent : "#D0D5D9" }]} />
                <ThemedText style={[styles.recentTripName, { color: textColor }]} numberOfLines={1}>
                  {trip.tripName}
                </ThemedText>
                <ThemedText style={[styles.recentTripMeta, { color: mutedTextColor }]}>
                  {trip.planByDay.length} ngày · {trip.status === "saved" ? "Đã lưu" : "Bản nháp"}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : null}

      <View style={styles.sectionHeader}>
        <View>
          <ThemedText style={[styles.sectionLabel, { color: accent }]}>
            GỢI Ý CHO BẠN
          </ThemedText>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Khám phá địa điểm phổ biến
          </ThemedText>
        </View>
        <Pressable onPress={() => router.push("/(tabs)/explore")}>
          <ThemedText style={[styles.linkText, { color: accent }]}>
            Xem tất cả
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.cardRow}
      >
        {destinations.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.destinationCard, { backgroundColor: cardColor }]}
            accessibilityRole="image"
            onPress={() => router.push("/(tabs)/explore")}
          >
            <Image
              source={item.image}
              style={styles.destinationImage}
              contentFit="cover"
            />
            <View style={styles.destinationBody}>
              <View style={styles.ratingPill}>
                <IconSymbol size={12} name="star.fill" color="#F5C451" />
                <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
              </View>
              <ThemedText
                style={[styles.destinationName, { color: textColor }]}
              >
                {item.name}
              </ThemedText>
              <View style={styles.destinationRow}>
                <IconSymbol
                  size={14}
                  name="mappin.and.ellipse"
                  color={mutedTextColor}
                />
                <ThemedText
                  style={[styles.destinationRegion, { color: mutedTextColor }]}
                >
                  {item.region}
                </ThemedText>
                <ThemedText style={[styles.linkText, { color: accent }]}>
                  Tìm hiểu
                </ThemedText>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          Trải nghiệm đặc sắc
        </ThemedText>
      </View>

      <View style={styles.categoryGrid}>
        {categories.map((item) => (
          <Pressable
            key={item.id}
            style={[
              styles.categoryCard,
              { backgroundColor: cardColor, borderColor },
            ]}
            onPress={() => {
              Sentry.captureException(
                new Error(`Category pressed: ${item.label}`),
              );
            }}
          >
            <View style={[styles.categoryIcon, { backgroundColor: "#EAF7F1" }]}>
              <Ionicons size={18} name={item.icon} color={accent} />
            </View>
            <ThemedText style={[styles.categoryLabel, { color: textColor }]}>
              {item.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  searchRow: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  heroCard: {
    marginTop: 18,
    borderRadius: 20,
    overflow: "hidden",
    minHeight: 170,
    justifyContent: "flex-end",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  heroContent: {
    padding: 20,
    gap: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  heroSubtitle: {
    fontSize: 13,
  },
  ctaButton: {
    alignSelf: "flex-start",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  ctaText: {
    color: "#0A3D2A",
    fontWeight: "700",
  },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
  },
  linkText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardRow: {
    paddingBottom: 8,
  },
  destinationCard: {
    width: 230,
    borderRadius: 20,
    marginRight: 16,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 5,
  },
  destinationImage: {
    width: "100%",
    height: 140,
  },
  destinationBody: {
    padding: 12,
    gap: 6,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1C1F23",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  ratingText: {
    color: "#F5C451",
    fontWeight: "700",
    fontSize: 12,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: "700",
  },
  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  destinationRegion: {
    fontSize: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    width: "47.5%",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  recentTripCard: {
    width: 200,
    padding: 14,
    borderRadius: 14,
    marginRight: 12,
    borderWidth: 1,
    gap: 6,
  },
  tripStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recentTripName: {
    fontSize: 14,
    fontWeight: "700",
  },
  recentTripMeta: {
    fontSize: 11,
  },
});
