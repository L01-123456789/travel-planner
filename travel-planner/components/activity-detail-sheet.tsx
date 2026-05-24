import { useEffect, useState } from "react";
import {
  Linking,
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
import type { Activity, Comment } from "@/lib/types";
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
  onClose: () => void;
  onRequestHintSolve: () => void;
};

const formatCurrency = (v: number) => new Intl.NumberFormat("vi-VN").format(v);

export function ActivityDetailSheet({ visible, activity, onClose, onRequestHintSolve }: Props) {
  const [showHours, setShowHours] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    if (!activity) return;
    let alive = true;
    mockApi.getComments(activity.id).then((list) => {
      if (alive) setComments(list);
    });
    return () => {
      alive = false;
    };
  }, [activity]);

  if (!activity) return null;

  const openMap = () => {
    const q = encodeURIComponent(activity.mapQuery ?? activity.address ?? activity.name);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
  };

  const submitComment = async () => {
    if (!commentDraft.trim()) return;
    setPostingComment(true);
    try {
      const c = await mockApi.createComment({
        activityId: activity.id,
        content: commentDraft.trim(),
      });
      setComments((prev) => [c, ...prev]);
      setCommentDraft("");
    } finally {
      setPostingComment(false);
    }
  };

  const gallery = activity.imageUrls.length > 0 ? activity.imageUrls : [PLACE_IMAGE];

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerBar}>
            <View style={styles.handle} />
          </View>
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gallery}
            >
              {gallery.map((src, i) => (
                <Image
                  key={i}
                  source={typeof src === "string" ? { uri: src } : src}
                  style={styles.galleryImage}
                  contentFit="cover"
                />
              ))}
            </ScrollView>

            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{activity.name}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="time" size={12} color={TEXT_MUTED} />
                  <Text style={styles.metaText}>
                    {activity.startTime}
                    {activity.endTime ? ` - ${activity.endTime}` : ""}
                    {activity.duration ? ` · ${activity.duration}` : ""}
                  </Text>
                </View>
              </View>
              <Pressable style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={18} color={TEXT_DARK} />
              </Pressable>
            </View>

            {activity.rating ? (
              <View style={{ marginTop: 6 }}>
                <StarRating rating={activity.rating} reviewCount={activity.reviewCount} />
              </View>
            ) : null}

            {activity.categories && activity.categories.length > 0 ? (
              <View style={styles.chipsRow}>
                {activity.categories.map((c) => (
                  <View key={c} style={styles.chip}>
                    <Text style={styles.chipText}>{c}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Pressable style={styles.addressRow} onPress={openMap}>
              <Ionicons name="location" size={16} color={ACCENT} />
              <Text style={styles.addressText}>{activity.address}</Text>
              <Text style={styles.mapLink}>Mở bản đồ</Text>
            </Pressable>

            <Text style={styles.description}>{activity.description}</Text>

            {activity.openingHours ? (
              <Pressable style={styles.infoRow} onPress={() => setShowHours((v) => !v)}>
                <Ionicons name="time-outline" size={16} color={TEXT_MUTED} />
                <Text style={styles.infoLabel}>Giờ mở cửa</Text>
                <Text style={styles.infoValue}>
                  {showHours ? activity.openingHours : "Xem"}
                </Text>
                <Ionicons
                  name={showHours ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={TEXT_MUTED}
                />
              </Pressable>
            ) : null}

            {activity.phone ? (
              <Pressable style={styles.infoRow} onPress={() => Linking.openURL(`tel:${activity.phone}`)}>
                <Ionicons name="call-outline" size={16} color={TEXT_MUTED} />
                <Text style={styles.infoLabel}>Liên hệ</Text>
                <Text style={[styles.infoValue, { color: ACCENT }]}>{activity.phone}</Text>
              </Pressable>
            ) : null}

            <View style={styles.priceBlock}>
              <View>
                <Text style={styles.priceLabel}>Chi phí dự kiến</Text>
                {activity.priceRange ? (
                  <Text style={styles.priceRange}>{activity.priceRange}</Text>
                ) : null}
              </View>
              <Text style={styles.priceValue}>
                {activity.priceEstimate > 0
                  ? `${formatCurrency(activity.priceEstimate)}đ`
                  : "Miễn phí"}
              </Text>
            </View>

            {activity.reviews && activity.reviews.length > 0 ? (
              <View style={styles.reviewsBlock}>
                <Text style={styles.sectionTitle}>Đánh giá nổi bật</Text>
                {activity.reviews.slice(0, 2).map((r) => (
                  <View key={r.id} style={styles.reviewItem}>
                    <View style={styles.reviewHead}>
                      <Text style={styles.reviewAuthor}>{r.author}</Text>
                      <StarRating rating={r.rating} size={11} showNumber={false} />
                    </View>
                    <Text style={styles.reviewText}>"{r.comment}"</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.commentsBlock}>
              <Text style={styles.sectionTitle}>Bình luận ({comments.length})</Text>
              <View style={styles.commentInputRow}>
                <TextInput
                  value={commentDraft}
                  onChangeText={setCommentDraft}
                  placeholder="Chia sẻ cảm nghĩ..."
                  placeholderTextColor={TEXT_MUTED}
                  style={styles.commentInput}
                />
                <Pressable
                  style={[styles.commentSend, (!commentDraft.trim() || postingComment) ? styles.commentSendDisabled : null]}
                  onPress={submitComment}
                  disabled={!commentDraft.trim() || postingComment}
                >
                  <Ionicons name="send" size={14} color="#FFFFFF" />
                </Pressable>
              </View>
              {comments.length === 0 ? (
                <Text style={styles.emptyComment}>Chưa có bình luận nào.</Text>
              ) : (
                comments.map((c) => (
                  <View key={c.id} style={styles.commentItem}>
                    <Text style={styles.commentAuthor}>{c.author}</Text>
                    <Text style={styles.commentText}>{c.content}</Text>
                  </View>
                ))
              )}
            </View>

            <Pressable style={styles.hintCta} onPress={onRequestHintSolve}>
              <Ionicons name="bulb" size={16} color="#FFFFFF" />
              <Text style={styles.hintCtaText}>Gợi ý thay thế</Text>
            </Pressable>
            <Text style={styles.hintHelper}>
              Không thấy hợp? Để AI gợi ý phương án phù hợp hơn.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(14,20,18,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: SURFACE, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%" },
  headerBar: { alignItems: "center", paddingTop: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: BORDER },
  body: { padding: 18, paddingBottom: 40, gap: 10 },
  gallery: { gap: 10, paddingRight: 4 },
  galleryImage: { width: 240, height: 150, borderRadius: 14 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 6 },
  name: { fontSize: 20, fontWeight: "700", color: TEXT_DARK },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  metaText: { fontSize: 12, color: TEXT_MUTED },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#EEF1F0", alignItems: "center", justifyContent: "center" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: ACCENT_SOFT },
  chipText: { fontSize: 11, color: ACCENT, fontWeight: "700" },
  addressRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#F4F6F5", borderRadius: 12, padding: 10, marginTop: 6,
  },
  addressText: { flex: 1, fontSize: 12, color: TEXT_DARK },
  mapLink: { fontSize: 12, fontWeight: "700", color: ACCENT },
  description: { fontSize: 13, color: TEXT_DARK, lineHeight: 19, marginTop: 4 },
  infoRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: BORDER,
  },
  infoLabel: { fontSize: 12, color: TEXT_MUTED, flex: 1 },
  infoValue: { fontSize: 12, color: TEXT_DARK, fontWeight: "600" },
  priceBlock: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: ACCENT_SOFT, padding: 14, borderRadius: 14, marginTop: 8,
  },
  priceLabel: { fontSize: 11, color: TEXT_MUTED, fontWeight: "700", letterSpacing: 1 },
  priceRange: { fontSize: 12, color: TEXT_DARK, marginTop: 2 },
  priceValue: { fontSize: 18, fontWeight: "700", color: ACCENT },
  reviewsBlock: { marginTop: 14, gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: TEXT_DARK },
  reviewItem: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: BORDER, gap: 6 },
  reviewHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewAuthor: { fontSize: 13, fontWeight: "700", color: TEXT_DARK },
  reviewText: { fontSize: 12, color: TEXT_MUTED, fontStyle: "italic", lineHeight: 17 },
  commentsBlock: { marginTop: 14, gap: 8 },
  commentInputRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: TEXT_DARK,
  },
  commentSend: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: ACCENT,
    alignItems: "center", justifyContent: "center",
  },
  commentSendDisabled: { opacity: 0.4 },
  emptyComment: { fontSize: 12, color: TEXT_MUTED, fontStyle: "italic" },
  commentItem: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: BORDER },
  commentAuthor: { fontSize: 12, fontWeight: "700", color: TEXT_DARK },
  commentText: { fontSize: 12, color: TEXT_DARK, marginTop: 2 },
  hintCta: {
    marginTop: 18,
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  hintCtaText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  hintHelper: { fontSize: 11, color: TEXT_MUTED, textAlign: "center", marginTop: 6 },
});
