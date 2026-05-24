import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const activeColor = "#1AA36C";
  const inactiveColor = "#B0B5BA";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E8EBEE",
          borderTopWidth: 1,
          height: 70,
          paddingTop: 8,
          paddingBottom: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => (
            <Ionicons size={22} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Chuyến đi",
          tabBarIcon: ({ color }) => (
            <Ionicons size={22} name="compass" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: "Lịch trình",
          tabBarIcon: ({ color }) => (
            <Ionicons size={22} name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color }) => (
            <Ionicons size={22} name="person" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
