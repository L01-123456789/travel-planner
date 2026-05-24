import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import * as mockApi from "@/lib/api-client";
import type { Activity, TravelPreference } from "@/lib/types";
import { StarRating } from "./star-rating";

const ACCENT = "#0B7D4E";
const ACCENT_SOFT = "#E7F2ED";
const TEXT_DARK = "#1F2328";
const TEXT_MUTED = "#6B737B";
const SURFACE = "#FFFFFF";
const BORDER = "#E4E8EB";

const PLACE_IMAGE = require("@/assets/images/1.png");

type Props = {
  visible: boolean;
  activity: Activity | null;
  preference: TravelPreference | null;
  onClose: () => void;
  onPick: (replacement: Activity) => void;
};

export function HintSolveSheet({ visible, activity, preference, onClose, onPick }: Props) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Activity[]>([]);

  const reset = () => {
    setComment("");
    setSuggestions([]);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!activity || !preference || !comment.trim()) return;
    setLoading(true);
    try {
      const res = await mockApi.fixActivity({
        travelPreference: preference,
        activity,
        comment: comment.trim(),
      });
      setSuggestions(res.suggestionList);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat("vi-VN").format(v);

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.iconBubble}>
              <Ionicons name="bulb" size={18} color={ACCENT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Gợi ý thay thế</Text>
              <Text style={styles.subtitle}>
                AI sẽ tìm phương án phù hợp hơn dựa trên phản hồi của bạn
              </Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={handleClose}>
              <Ionicons name="close" size={18} color={TEXT_DARK} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.label}>VÌ SAO BẠN MUỐN ĐỔI?</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="VD: quá đắt, quá đông, không phù hợp với trẻ em..."
              placeholderTextColor={TEXT_MUTED}
              multiline
              style={styles.textArea}
            />

            <Pressable
              style={[styles.cta, (!comment.trim() || loading) ? styles.ctaDisabled : null]}
              onPress={handleSubmit}
              disabled={!comment.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.ctaText}>Tìm gợi ý</Text>
              )}
            </Pressable>

            {suggestions.length > 0 ? (
              <View style={{ marginTop: 18, gap: 12 }}>
                <Text style={styles.resultLabel}>
                  {suggestions.length} GỢI Ý PHÙ HỢP HƠN
                </Text>
                {suggestions.map((s) => (
                  <View key={s.activityId ?? s.id} style={styles.suggCard}>
                    <Image source={PLACE_IMAGE} style={styles.suggImage} contentFit="cover" />
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={styles.suggName}>{s.name}</Text>
                      {s.rating ? <StarRating rating={s.rating} reviewCount={s.reviewCount} size={12} /> : null}
                      <Text style={styles.suggMeta} numberOfLines={2}>
                        {s.description}
                      </Text>
                      <Text style={styles.suggPrice}>
                        {s.priceEstimate > 0 ? `${formatCurrency(s.priceEstimate)}đ` : "Miễn phí"}
                      </Text>
                      <Pressable
                        style={styles.pickBtn}
                        onPress={() => {
                          onPick(s);
                          reset();
                        }}
                      >
                        <Text style={styles.pickBtnText}>Chọn</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(14,20,18,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: SURFACE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  iconBubble: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: ACCENT_SOFT,
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  subtitle: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#EEF1F0", alignItems: "center", justifyContent: "center" },
  body: { padding: 18, paddingBottom: 36 },
  label: { fontSize: 11, fontWeight: "700", color: TEXT_MUTED, letterSpacing: 1.1, marginBottom: 8 },
  textArea: {
    minHeight: 90,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    color: TEXT_DARK,
    fontSize: 14,
    textAlignVertical: "top",
  },
  cta: { marginTop: 14, backgroundColor: ACCENT, paddingVertical: 14, borderRadius: 999, alignItems: "center" },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  resultLabel: { fontSize: 11, fontWeight: "700", color: TEXT_MUTED, letterSpacing: 1 },
  suggCard: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
  },
  suggImage: { width: 84, height: 84, borderRadius: 12 },
  suggName: { fontSize: 14, fontWeight: "700", color: TEXT_DARK },
  suggMeta: { fontSize: 12, color: TEXT_MUTED, lineHeight: 16 },
  suggPrice: { fontSize: 13, fontWeight: "700", color: ACCENT },
  pickBtn: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: ACCENT,
  },
  pickBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
});
