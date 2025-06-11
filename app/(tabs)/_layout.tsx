// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { useAppTheme } from "@/hooks/useThemeConfig";
import { Appbar, IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  const { theme, isDark, toggleTheme } = useAppTheme();

  return (
    <>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: theme.colors.primary,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.surface
          },
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "home";
            switch (route.name) {
              case "dashboard":
                iconName = "analytics";
                break;
              case "index":
                iconName = "home";
                break;
              case "transacciones":
                iconName = "cash";
                break;
              case "deuda":
                iconName = "wallet";
                break;
              case "configuracion":
                iconName = "settings";
                break;
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        })}
      />
    </>
  );
}
