import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useAppData } from "@/context/AppDataContext";
import { getStreak, getTodaySummary } from "@/lib/analytics";
import { formatDuration } from "@/lib/time";

export default function DashboardScreen() {
  const router = useRouter();
  const { isLoading, subjects, sessions, addSubject, settings } = useAppData();
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [subjectName, setSubjectName] = useState("");

  const todaySummary = useMemo(() => getTodaySummary(sessions), [sessions]);
  const streak = useMemo(() => getStreak(sessions), [sessions]);

  const dailyGoalSec = settings.dailyGoalMin * 60;
  const progress = Math.min(100, Math.round((todaySummary.totalDurationSec / Math.max(dailyGoalSec, 1)) * 100));

  const recentSessions = sessions.slice(0, 5).map((session) => {
    const subject = subjects.find((item) => item.id === session.subjectId);
    return {
      ...session,
      subjectName: subject?.name ?? "Unknown",
      subjectColor: subject?.color ?? "#64748b",
    };
  });

  async function handleAddSubject() {
    if (!subjectName.trim()) return;
    await addSubject(subjectName);
    setSubjectName("");
    setIsAddingSubject(false);
  }

  return (
    <ScrollView className="flex-1 bg-indigo-50" contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 30 }}>
      <View className="overflow-hidden rounded-3xl border border-indigo-200 bg-white p-5">
        <View className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-indigo-100" />
        <View className="absolute -left-8 bottom-0 h-20 w-20 rounded-full bg-blue-100" />
        <SectionHeader
          eyebrow="Today"
          title="Stay Locked In"
          subtitle="Your focus scoreboard for the day."
        />
        <View className="mt-1">
          <Text className="text-sm font-semibold text-slate-700">Daily goal progress</Text>
          <View className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
            <View className="h-full rounded-full bg-indigo-600" style={{ width: `${progress}%` }} />
          </View>
          <Text className="mt-1 text-xs text-slate-600">{progress}% of {settings.dailyGoalMin} min target</Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <StatCard label="Study Time" value={formatDuration(todaySummary.totalDurationSec)} accent="#4f46e5" />
        <StatCard label="Sessions" value={String(todaySummary.sessionCount)} accent="#059669" />
      </View>

      <StatCard
        label="Current Streak"
        value={`${streak} day${streak === 1 ? "" : "s"}`}
        helper={streak > 0 ? "Consecutive active study days" : "Start a session today to begin"}
        accent="#d97706"
      />

      <View className="rounded-3xl border border-slate-200 bg-white p-4">
        <SectionHeader title="Quick Actions" />
        <View className="flex-row gap-3">
          <Pressable
            className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3"
            onPress={() => router.push("./sessions")}
          >
            <Ionicons name="play" size={16} color="#ffffff" />
            <Text className="text-center font-bold text-white">Start Session</Text>
          </Pressable>
          <Pressable
            className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3"
            onPress={() => setIsAddingSubject((prev) => !prev)}
          >
            <Ionicons name="add-circle-outline" size={16} color="#0f172a" />
            <Text className="text-center font-bold text-slate-800">Add Subject</Text>
          </Pressable>
        </View>

        {isAddingSubject ? (
          <View className="mt-3 flex-row gap-2">
            <TextInput
              value={subjectName}
              onChangeText={setSubjectName}
              placeholder="Subject name"
              placeholderTextColor="#94a3b8"
              className="flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2.5"
            />
            <Pressable className="rounded-2xl bg-slate-900 px-4 py-2.5" onPress={handleAddSubject}>
              <Text className="font-bold text-white">Save</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View className="rounded-3xl border border-slate-200 bg-white p-4">
        <SectionHeader title="Recent Sessions" />
        {isLoading ? (
          <Text className="text-sm text-slate-500">Loading...</Text>
        ) : recentSessions.length === 0 ? (
          <EmptyState
            title="No sessions yet"
            description="Start your first study session to populate your dashboard metrics."
          />
        ) : (
          <View className="gap-2">
            {recentSessions.map((session) => (
              <View key={session.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: session.subjectColor }} />
                    <Text className="font-semibold text-slate-800">{session.subjectName}</Text>
                  </View>
                  <Text className="text-sm font-semibold text-slate-600">{formatDuration(session.durationSec)}</Text>
                </View>
                <Text className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  {new Date(session.endedAt).toLocaleDateString()} • {session.mode}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
