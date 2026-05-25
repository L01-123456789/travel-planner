import { useCallback, useState } from "react";
import {
  Alert,
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
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import * as mockApi from "@/lib/api-client";
import type { Expense, ExpenseBalance, ExpenseSummary, ExpenseType, ExpenseUser } from "@/lib/types";

const ACCENT = "#0B7D4E";
const ACCENT_SOFT = "#E7F2ED";
const TEXT_DARK = "#1F2328";
const TEXT_MUTED = "#6B737B";
const SURFACE = "#FFFFFF";
const BACKGROUND = "#F7F8F7";
const BORDER = "#E4E8EB";

const TYPE_OPTIONS: { id: ExpenseType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: "food", label: "Ăn uống", icon: "restaurant" },
  { id: "transport", label: "Di chuyển", icon: "car" },
  { id: "accommodation", label: "Lưu trú", icon: "bed" },
  { id: "activity", label: "Hoạt động", icon: "compass" },
  { id: "other", label: "Khác", icon: "ellipsis-horizontal" },
];

const formatCurrency = (v: number) => new Intl.NumberFormat("vi-VN").format(v);

export default function PlanBudgetScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  const [users, setUsers] = useState<ExpenseUser[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balance, setBalance] = useState<ExpenseBalance[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);

  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!tripId) return;
    const [u, e, b, s] = await Promise.all([
      mockApi.getExpenseUsers(tripId),
      mockApi.getExpenses(tripId),
      mockApi.getExpenseBalance(tripId),
      mockApi.getExpenseSummary(tripId),
    ]);
    setUsers(u);
    setExpenses(e);
    setBalance(b);
    setSummary(s);
  }, [tripId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  if (!tripId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}><Text>Thiếu thông tin chuyến đi.</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={TEXT_DARK} />
        </Pressable>
        <Text style={styles.title}>Quản lý ngân sách</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TỔNG CHI TIÊU</Text>
          <Text style={styles.summaryValue}>{formatCurrency(summary?.total ?? 0)}đ</Text>
          <Text style={styles.summaryMeta}>{summary?.count ?? 0} khoản chi · {users.length} người</Text>
          {summary && summary.count > 0 ? (
            <View style={styles.byTypeRow}>
              {TYPE_OPTIONS.map((t) => {
                const v = summary.byType[t.id];
                if (!v) return null;
                return (
                  <View key={t.id} style={styles.typePill}>
                    <Ionicons name={t.icon} size={11} color={ACCENT} />
                    <Text style={styles.typePillText}>{formatCurrency(v)}đ</Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Người tham gia ({users.length})</Text>
            <Pressable onPress={() => setAddUserOpen(true)}>
              <Text style={styles.linkText}>+ Thêm</Text>
            </Pressable>
          </View>
          <View style={styles.usersRow}>
            {users.map((u) => (
              <View key={u.id} style={styles.userChip}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>{u.name.slice(0, 1).toUpperCase()}</Text>
                </View>
                <Text style={styles.userName}>{u.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Chi tiêu ({expenses.length})</Text>
            <Pressable onPress={() => setAddExpenseOpen(true)}>
              <Text style={styles.linkText}>+ Thêm chi phí</Text>
            </Pressable>
          </View>
          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={26} color={TEXT_MUTED} />
              <Text style={styles.emptyText}>Chưa có khoản chi nào</Text>
            </View>
          ) : (
            expenses.map((e) => {
              const type = TYPE_OPTIONS.find((t) => t.id === e.expenseType);
              return (
                <View key={e.expenseId} style={styles.expenseCard}>
                  <View style={styles.expenseIcon}>
                    <Ionicons name={type?.icon ?? "ellipsis-horizontal"} size={16} color={ACCENT} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.expenseName}>{e.expenseName}</Text>
                    <Text style={styles.expenseMeta}>
                      {type?.label ?? "Khác"} · {e.paidByName} trả · chia {e.splitBetween.length} người
                    </Text>
                  </View>
                  <Text style={styles.expenseAmount}>{formatCurrency(e.amount)}đ</Text>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cân đối</Text>
          {balance.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
          ) : (
            balance.map((b) => (
              <View key={b.userId} style={styles.balanceRow}>
                <Text style={styles.balanceName}>{b.userName}</Text>
                <Text
                  style={[
                    styles.balanceValue,
                    { color: b.balance >= 0 ? ACCENT : "#D92D20" },
                  ]}
                >
                  {b.balance >= 0 ? "+" : ""}
                  {formatCurrency(b.balance)}đ
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <AddExpenseModal
        visible={addExpenseOpen}
        users={users}
        onClose={() => setAddExpenseOpen(false)}
        onSubmit={async (payload) => {
          await mockApi.addExpense({ tripId, ...payload });
          await refresh();
          setAddExpenseOpen(false);
        }}
      />

      <AddUserModal
        visible={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        onSubmit={async (name) => {
          await mockApi.addExpenseUser(tripId, name);
          await refresh();
          setAddUserOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

function AddExpenseModal({
  visible,
  users,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  users: ExpenseUser[];
  onClose: () => void;
  onSubmit: (payload: {
    expenseName: string;
    expenseType: ExpenseType;
    amount: number;
    paidByUserId: string;
    paidByName: string;
    splitBetween: string[];
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ExpenseType>("food");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState<string>(users[0]?.id ?? "");
  const [splitAll, setSplitAll] = useState(true);

  const handleSubmit = async () => {
    const amt = parseInt(amount.replace(/\D/g, ""), 10);
    if (!name.trim() || !amt || amt <= 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên và số tiền hợp lệ.");
      return;
    }
    const payer = users.find((u) => u.id === paidBy) ?? users[0];
    if (!payer) return;
    await onSubmit({
      expenseName: name.trim(),
      expenseType: type,
      amount: amt,
      paidByUserId: payer.id,
      paidByName: payer.name,
      splitBetween: splitAll ? users.map((u) => u.id) : [payer.id],
    });
    setName("");
    setAmount("");
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={modalStyles.backdrop}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Thêm chi phí</Text>
            <Pressable onPress={onClose}><Ionicons name="close" size={20} color={TEXT_DARK} /></Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 18, gap: 14 }}>
            <View>
              <Text style={modalStyles.label}>TÊN CHI PHÍ</Text>
              <TextInput value={name} onChangeText={setName} placeholder="VD: Ăn tối Phở Bát Đàn" placeholderTextColor={TEXT_MUTED} style={modalStyles.input} />
            </View>
            <View>
              <Text style={modalStyles.label}>LOẠI</Text>
              <View style={modalStyles.typeRow}>
                {TYPE_OPTIONS.map((t) => (
                  <Pressable
                    key={t.id}
                    style={[modalStyles.typeChip, type === t.id ? modalStyles.typeChipActive : null]}
                    onPress={() => setType(t.id)}
                  >
                    <Ionicons name={t.icon} size={13} color={type === t.id ? "#FFFFFF" : ACCENT} />
                    <Text style={[modalStyles.typeChipText, type === t.id ? { color: "#FFFFFF" } : null]}>
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View>
              <Text style={modalStyles.label}>SỐ TIỀN (đ)</Text>
              <TextInput
                value={amount}
                onChangeText={(v) => setAmount(v.replace(/\D/g, ""))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={TEXT_MUTED}
                style={modalStyles.input}
              />
            </View>
            <View>
              <Text style={modalStyles.label}>NGƯỜI TRẢ</Text>
              <View style={modalStyles.payerRow}>
                {users.map((u) => (
                  <Pressable
                    key={u.id}
                    style={[modalStyles.payerChip, paidBy === u.id ? modalStyles.payerChipActive : null]}
                    onPress={() => setPaidBy(u.id)}
                  >
                    <Text style={[modalStyles.payerText, paidBy === u.id ? { color: "#FFFFFF" } : null]}>
                      {u.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <Pressable style={modalStyles.toggleRow} onPress={() => setSplitAll((v) => !v)}>
              <Ionicons name={splitAll ? "checkbox" : "square-outline"} size={20} color={ACCENT} />
              <Text style={modalStyles.toggleText}>Chia đều cho tất cả mọi người</Text>
            </Pressable>
            <Pressable style={modalStyles.cta} onPress={handleSubmit}>
              <Text style={modalStyles.ctaText}>Thêm chi phí</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function AddUserModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={modalStyles.backdropCenter}>
        <View style={modalStyles.dialog}>
          <Text style={modalStyles.title}>Thêm người tham gia</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Tên người tham gia"
            placeholderTextColor={TEXT_MUTED}
            style={[modalStyles.input, { marginTop: 12 }]}
          />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <Pressable style={[modalStyles.cta, { flex: 1, backgroundColor: "#EEF1F0" }]} onPress={onClose}>
              <Text style={[modalStyles.ctaText, { color: TEXT_DARK }]}>Huỷ</Text>
            </Pressable>
            <Pressable
              style={[modalStyles.cta, { flex: 1 }]}
              onPress={async () => {
                if (!name.trim()) return;
                await onSubmit(name.trim());
                setName("");
              }}
            >
              <Text style={modalStyles.ctaText}>Thêm</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: {
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: "#EEF1F0",
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  content: { padding: 20, paddingBottom: 60, gap: 18 },
  summaryCard: {
    backgroundColor: ACCENT, borderRadius: 18, padding: 18, gap: 6,
  },
  summaryLabel: { color: "#D6EBE0", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  summaryValue: { color: "#FFFFFF", fontSize: 30, fontWeight: "700" },
  summaryMeta: { color: "#D6EBE0", fontSize: 12 },
  byTypeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  typePill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  typePillText: { fontSize: 11, fontWeight: "700", color: ACCENT },
  section: { gap: 10 },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: TEXT_DARK },
  linkText: { fontSize: 13, color: ACCENT, fontWeight: "700" },
  usersRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  userChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
  },
  userAvatar: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: ACCENT,
    alignItems: "center", justifyContent: "center",
  },
  userAvatarText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  userName: { fontSize: 12, color: TEXT_DARK, fontWeight: "600" },
  emptyState: {
    alignItems: "center", padding: 20, borderRadius: 14,
    backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, gap: 8,
  },
  emptyText: { color: TEXT_MUTED, fontSize: 13 },
  expenseCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14,
    backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
  },
  expenseIcon: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: ACCENT_SOFT,
    alignItems: "center", justifyContent: "center",
  },
  expenseName: { fontSize: 14, fontWeight: "700", color: TEXT_DARK },
  expenseMeta: { fontSize: 11, color: TEXT_MUTED, marginTop: 2 },
  expenseAmount: { fontSize: 14, fontWeight: "700", color: TEXT_DARK },
  balanceRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 14, borderRadius: 14,
    backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
  },
  balanceName: { fontSize: 14, color: TEXT_DARK, fontWeight: "600" },
  balanceValue: { fontSize: 15, fontWeight: "700" },
});

const modalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(14,20,18,0.5)", justifyContent: "flex-end" },
  backdropCenter: { flex: 1, backgroundColor: "rgba(14,20,18,0.5)", justifyContent: "center", paddingHorizontal: 24 },
  sheet: { backgroundColor: SURFACE, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%" },
  dialog: { backgroundColor: SURFACE, borderRadius: 18, padding: 18 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 18, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  title: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  label: { fontSize: 11, fontWeight: "700", color: TEXT_MUTED, letterSpacing: 1, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: TEXT_DARK,
  },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE,
  },
  typeChipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  typeChipText: { fontSize: 12, fontWeight: "700", color: TEXT_DARK },
  payerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  payerChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE,
  },
  payerChipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  payerText: { fontSize: 13, fontWeight: "600", color: TEXT_DARK },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  toggleText: { fontSize: 13, color: TEXT_DARK },
  cta: {
    backgroundColor: ACCENT, paddingVertical: 14, borderRadius: 999,
    alignItems: "center", marginTop: 6,
  },
  ctaText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});
