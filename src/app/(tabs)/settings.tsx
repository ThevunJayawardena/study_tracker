import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAppData } from "@/context/AppDataContext";

export default function SettingsScreen() {
  const { settings, updateSettings, clearAllData } = useAppData();
  const [dailyGoalMin, setDailyGoalMin] = useState(String(settings.dailyGoalMin));
  const [pomodoroFocusMin, setPomodoroFocusMin] = useState(String(settings.pomodoroFocusMin));
  const [shortBreakMin, setShortBreakMin] = useState(String(settings.shortBreakMin));
  const [longBreakMin, setLongBreakMin] = useState(String(settings.longBreakMin));
  const [longBreakEvery, setLongBreakEvery] = useState(String(settings.longBreakEvery));
  const [remindersEnabled, setRemindersEnabled] = useState(settings.remindersEnabled);

  useEffect(() => {
    setDailyGoalMin(String(settings.dailyGoalMin));
    setPomodoroFocusMin(String(settings.pomodoroFocusMin));
    setShortBreakMin(String(settings.shortBreakMin));
    setLongBreakMin(String(settings.longBreakMin));
    setLongBreakEvery(String(settings.longBreakEvery));
    setRemindersEnabled(settings.remindersEnabled);
  }, [settings]);

  async function handleSave() {
    await updateSettings({
      dailyGoalMin: Math.max(1, Number(dailyGoalMin) || settings.dailyGoalMin),
      pomodoroFocusMin: Math.max(1, Number(pomodoroFocusMin) || settings.pomodoroFocusMin),
      shortBreakMin: Math.max(1, Number(shortBreakMin) || settings.shortBreakMin),
      longBreakMin: Math.max(1, Number(longBreakMin) || settings.longBreakMin),
      longBreakEvery: Math.max(1, Number(longBreakEvery) || settings.longBreakEvery),
      remindersEnabled,
    });
    Alert.alert("Saved", "Settings have been updated.");
  }

  function confirmReset() {
    Alert.alert("Reset all data", "This clears subjects, sessions, and settings.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          await clearAllData();
        },
      },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-indigo-50" contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 30 }}>
      <SectionHeader eyebrow="Preferences" title="Settings" subtitle="Tune your study defaults and reset local data." />

      <View className="rounded-3xl border border-slate-200 bg-white p-4">
        <RowHeader icon="flag" title="Goals" />
        <LabeledNumberInput label="Daily Goal (minutes)" value={dailyGoalMin} onChangeText={setDailyGoalMin} />
      </View>

      <View className="rounded-3xl border border-slate-200 bg-white p-4">
        <RowHeader icon="timer" title="Pomodoro Defaults" />
        <LabeledNumberInput label="Focus Minutes" value={pomodoroFocusMin} onChangeText={setPomodoroFocusMin} />
        <LabeledNumberInput label="Short Break Minutes" value={shortBreakMin} onChangeText={setShortBreakMin} />
        <LabeledNumberInput label="Long Break Minutes" value={longBreakMin} onChangeText={setLongBreakMin} />
        <LabeledNumberInput label="Long Break Every (cycles)" value={longBreakEvery} onChangeText={setLongBreakEvery} />
      </View>

      <View className="rounded-3xl border border-slate-200 bg-white p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Ionicons name="notifications" size={16} color="#334155" />
            <Text className="text-base font-semibold text-slate-800">Reminders</Text>
          </View>
          <Switch value={remindersEnabled} onValueChange={setRemindersEnabled} />
        </View>
      </View>

      <Pressable className="flex-row items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3.5" onPress={handleSave}>
        <Ionicons name="save" size={16} color="#ffffff" />
        <Text className="text-center font-bold text-white">Save Settings</Text>
      </Pressable>

      <Pressable
        className="flex-row items-center justify-center gap-2 rounded-2xl border border-red-300 bg-red-50 px-4 py-3.5"
        onPress={confirmReset}
      >
        <Ionicons name="trash" size={16} color="#b91c1c" />
        <Text className="text-center font-bold text-red-700">Reset All Data</Text>
      </Pressable>
    </ScrollView>
  );
}

function LabeledNumberInput({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
}) {
  return (
    <View className="mb-3">
      <Text className="mb-1 text-sm font-medium text-slate-600">{label}</Text>
      <TextInput
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#94a3b8"
        className="rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900"
      />
    </View>
  );
}

function RowHeader({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
  return (
    <View className="mb-2 flex-row items-center gap-2">
      <View className="h-7 w-7 items-center justify-center rounded-full bg-indigo-100">
        <Ionicons name={icon} size={14} color="#3730a3" />
      </View>
      <Text className="text-lg font-bold text-slate-900">{title}</Text>
    </View>
  );
}
