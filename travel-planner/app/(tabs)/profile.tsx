import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Ho so</ThemedText>
      <ThemedText>Trang mau cho tab Ho so.</ThemedText>
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
