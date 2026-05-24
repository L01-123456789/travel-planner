import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  rating: number;
  reviewCount?: number;
  size?: number;
  showNumber?: boolean;
};

export function StarRating({ rating, reviewCount, size = 14, showNumber = true }: Props) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = [0, 1, 2, 3, 4].map((i) => {
    if (i < full) return "star" as const;
    if (i === full && half) return "star-half" as const;
    return "star-outline" as const;
  });

  return (
    <View style={styles.row}>
      <View style={styles.row}>
        {stars.map((name, i) => (
          <Ionicons key={i} name={name} size={size} color="#F5A524" />
        ))}
      </View>
      {showNumber ? (
        <Text style={[styles.text, { fontSize: size - 1 }]}>
          {rating.toFixed(1)}
          {reviewCount ? ` · ${reviewCount.toLocaleString("vi-VN")} đánh giá` : ""}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  text: { color: "#1F2328", fontWeight: "600" },
});
