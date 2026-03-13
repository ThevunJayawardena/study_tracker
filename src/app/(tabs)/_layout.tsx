import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#f8fafc" },
        headerTitleStyle: { fontWeight: "700" },
        tabBarActiveTintColor: "#2563eb",
        tabBarLabelStyle: { fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard", tabBarLabel: "Dashboard" }} />
      <Tabs.Screen name="sessions" options={{ title: "Sessions", tabBarLabel: "Sessions" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics", tabBarLabel: "Analytics" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarLabel: "Settings" }} />
    </Tabs>
  );
}
