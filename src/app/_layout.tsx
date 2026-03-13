import { Stack } from "expo-router";
import "../globals.css";
import { AppDataProvider } from "@/context/AppDataContext";

export default function RootLayout() {
  return (
    <AppDataProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AppDataProvider>
  );
}
