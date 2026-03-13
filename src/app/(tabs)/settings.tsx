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
    <ScrollView className="flex-1 bg-slate-100" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <SectionHeader title="Settings" subtitle="Tune your study defaults and reset local data." />

      <View className="rounded-2xl border border-slate-200 bg-white p-4">
        <SectionHeader title="Goals" />
        <LabeledNumberInput label="Daily Goal (minutes)" value={dailyGoalMin} onChangeText={setDailyGoalMin} />
      </View>

      <View className="rounded-2xl border border-slate-200 bg-white p-4">
        <SectionHeader title="Pomodoro Defaults" />
        <LabeledNumberInput label="Focus Minutes" value={pomodoroFocusMin} onChangeText={setPomodoroFocusMin} />
        <LabeledNumberInput label="Short Break Minutes" value={shortBreakMin} onChangeText={setShortBreakMin} />
        <LabeledNumberInput label="Long Break Minutes" value={longBreakMin} onChangeText={setLongBreakMin} />
        <LabeledNumberInput label="Long Break Every (cycles)" value={longBreakEvery} onChangeText={setLongBreakEvery} />
      </View>

      <View className="rounded-2xl border border-slate-200 bg-white p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-medium text-slate-800">Reminders</Text>
          <Switch value={remindersEnabled} onValueChange={setRemindersEnabled} />
        </View>
      </View>

      <Pressable className="rounded-xl bg-blue-600 px-4 py-3" onPress={handleSave}>
        <Text className="text-center font-semibold text-white">Save Settings</Text>
      </Pressable>

      <Pressable className="rounded-xl border border-red-300 bg-red-50 px-4 py-3" onPress={confirmReset}>
        <Text className="text-center font-semibold text-red-700">Reset All Data</Text>
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
      <Text className="mb-1 text-sm text-slate-600">{label}</Text>
      <TextInput
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
      />
    </View>
  );
}
