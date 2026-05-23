import { useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { updateOnboardingState } from "@/lib/onboarding-store";

const ACCENT = "#0B7D4E";
const TEXT_DARK = "#1F2328";
const TEXT_MUTED = "#6B737B";
const SURFACE = "#FFFFFF";
const BACKGROUND = "#F7F8F7";
const BORDER = "#E4E8EB";
const TRACK = "#DDE3E1";

const CARD_RADIUS = 18;

const BASE_INTERESTS = [
  {
    id: "nature",
    title: "Cảnh quan thiên nhiên",
    image: require("@/assets/images/1.png"),
  },
  {
    id: "adventure",
    title: "Hoạt động mạo hiểm",
    image: require("@/assets/images/2.png"),
  },
  {
    id: "history",
    title: "Di tích lịch sử",
    image: require("@/assets/images/2.png"),
  },
  {
    id: "hidden",
    title: "Địa điểm ít người biết tới",
    image: require("@/assets/images/1.png"),
  },
  {
    id: "food",
    title: "Ẩm thực địa phương",
    image: require("@/assets/images/2.png"),
  },
];

export default function InterestsScreen() {
  const [selected, setSelected] = useState<string[]>(["nature", "hidden"]);
  const [items, setItems] = useState(BASE_INTERESTS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newInterestName, setNewInterestName] = useState("");
  const [newInterestNote, setNewInterestNote] = useState("");
  const router = useRouter();

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewInterestName("");
    setNewInterestNote("");
  };

  const handleCreatePlan = () => {
    updateOnboardingState({ interests: selected });
    router.replace("/plan-creating");
  };

  const handleAddInterest = () => {
    const trimmed = newInterestName.trim();
    if (!trimmed) {
      return;
    }
    const baseId = trimmed.toLowerCase().replace(/\s+/g, "-");
    let uniqueId = baseId;
    let counter = 1;
    while (items.some((item) => item.id === uniqueId)) {
      counter += 1;
      uniqueId = `${baseId}-${counter}`;
    }

    const created = {
      id: uniqueId,
      title: trimmed,
      image: require("@/assets/images/2.png"),
    };
    setItems((current) => [...current, created]);
    setSelected((current) => [...current, created.id]);
    closeAddModal();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={ACCENT} />
          </Pressable>
          <Text style={styles.brandText}>The Curator</Text>
          <Text style={styles.stepText}>BƯỚC 03/04</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.title}>Thiết kế trải nghiệm của riêng bạn</Text>
        <Text style={styles.subtitle}>
          Chọn các chủ đề bạn quan tâm để chúng tôi biên soạn một hành trình
          mang đậm dấu ấn cá nhân.
        </Text>

        <View style={styles.grid}>
          {items.map((item, index) => {
            const isSelected = selected.includes(item.id);
            return (
              <Pressable
                key={item.id}
                style={[
                  styles.card,
                  index % 2 === 1 ? styles.cardOffset : null,
                  isSelected ? styles.cardSelected : null,
                ]}
                onPress={() => toggle(item.id)}
              >
                <Image
                  source={item.image}
                  style={styles.cardImage}
                  contentFit="cover"
                />
                <View style={styles.cardOverlay} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
                {isSelected ? (
                  <View style={styles.cardCheck}>
                    <Ionicons name="checkmark" size={14} color={ACCENT} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
          <Pressable
            style={[styles.card, styles.addCard]}
            onPress={() => setIsAddModalOpen(true)}
          >
            <View style={styles.addCircle}>
              <Ionicons name="add" size={20} color={TEXT_DARK} />
            </View>
            <Text style={styles.addLabel}>Thêm sở thích</Text>
          </Pressable>
        </View>

        <View style={styles.quoteCard}>
          <Ionicons name="quote" size={20} color={ACCENT} />
          <Text style={styles.quoteText}>
            "Hành trình không chỉ là việc đến một vùng đất mới, mà là cách chúng
            ta nhìn thấy thế giới qua những lăng kính khác nhau."
          </Text>
        </View>

        <Pressable style={styles.ctaButton} onPress={handleCreatePlan}>
          <Text style={styles.ctaText}>Tạo lịch trình</Text>
          <Ionicons name="sparkles" size={16} color="#FFFFFF" />
        </Pressable>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={isAddModalOpen}
        onRequestClose={closeAddModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Thêm sở thích cá nhân</Text>
                <View style={styles.modalUnderline} />
              </View>
              <Pressable style={styles.modalClose} onPress={closeAddModal}>
                <Ionicons name="close" size={16} color={TEXT_DARK} />
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>TÊN SỞ THÍCH</Text>
            <TextInput
              value={newInterestName}
              onChangeText={setNewInterestName}
              placeholder="Ví dụ: Chụp ảnh đường phố"
              placeholderTextColor={TEXT_MUTED}
              style={styles.modalInput}
            />

            <Text style={styles.modalLabel}>MÔ TẢ NGẮN (KHÔNG BẮT BUỘC)</Text>
            <TextInput
              value={newInterestNote}
              onChangeText={setNewInterestNote}
              placeholder="Chia sẻ thêm về đam mê của bạn..."
              placeholderTextColor={TEXT_MUTED}
              style={[styles.modalInput, styles.modalTextarea]}
              multiline
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalCancel]}
                onPress={closeAddModal}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={handleAddInterest}
              >
                <Text style={styles.modalConfirmText}>Thêm</Text>
              </Pressable>
            </View>
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
    paddingTop: 18,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFF4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "700",
    color: ACCENT,
  },
  progressTrack: {
    height: 6,
    backgroundColor: TRACK,
    borderRadius: 3,
    marginBottom: 18,
  },
  progressFill: {
    width: "65%",
    height: 6,
    backgroundColor: ACCENT,
    borderRadius: 3,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 6,
  },
  card: {
    width: "48%",
    height: 170,
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardSelected: {
    borderColor: ACCENT,
    borderWidth: 2,
  },
  cardOffset: {
    marginTop: 8,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  cardContent: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cardCheck: {
    position: "absolute",
    left: 10,
    top: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  addCard: {
    backgroundColor: "#F3F6F4",
    borderColor: "#C7D0C9",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  addCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E7ECE9",
    alignItems: "center",
    justifyContent: "center",
  },
  addLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontWeight: "600",
  },
  addInputRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_DARK,
  },
  addAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  addCancel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EEF1F0",
    alignItems: "center",
    justifyContent: "center",
  },
  quoteCard: {
    marginTop: 22,
    backgroundColor: "#F4F7F5",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EEF2EF",
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  quoteText: {
    flex: 1,
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 20,
  },
  ctaButton: {
    marginTop: 18,
    backgroundColor: "#0B0D0F",
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17, 22, 20, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: SURFACE,
    borderRadius: 22,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  modalUnderline: {
    width: 34,
    height: 3,
    borderRadius: 2,
    backgroundColor: ACCENT,
    marginTop: 6,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F3F2",
    alignItems: "center",
    justifyContent: "center",
  },
  modalLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#F1F3F2",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: TEXT_DARK,
    fontSize: 14,
    marginBottom: 16,
  },
  modalTextarea: {
    minHeight: 92,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancel: {
    backgroundColor: "#E3E4E3",
  },
  modalConfirm: {
    backgroundColor: ACCENT,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
