import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

export default function PlanScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Lich trinh</ThemedText>
      <ThemedText>Trang mau cho tab Lich trinh.</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    gap: 8,
  },
});
