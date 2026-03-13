import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useAppData } from "@/context/AppDataContext";
import { getStreak, getTodaySummary } from "@/lib/analytics";
import { formatDuration } from "@/lib/time";

export default function DashboardScreen() {
  const router = useRouter();
  const { isLoading, subjects, sessions, addSubject } = useAppData();
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [subjectName, setSubjectName] = useState("");

  const todaySummary = useMemo(() => getTodaySummary(sessions), [sessions]);
  const streak = useMemo(() => getStreak(sessions), [sessions]);

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
    <ScrollView className="flex-1 bg-slate-100" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <SectionHeader title="Today" subtitle="Keep your study momentum visible and consistent." />

      <View className="flex-row gap-3">
        <StatCard label="Study Time" value={formatDuration(todaySummary.totalDurationSec)} />
        <StatCard label="Sessions" value={String(todaySummary.sessionCount)} accent="#16a34a" />
      </View>

      <StatCard
        label="Current Streak"
        value={`${streak} day${streak === 1 ? "" : "s"}`}
        helper={streak > 0 ? "Consecutive active study days" : "Start a session today to begin"}
        accent="#d97706"
      />

      <View className="rounded-2xl border border-slate-200 bg-white p-4">
        <SectionHeader title="Quick Actions" />
        <View className="flex-row gap-3">
          <Pressable className="flex-1 rounded-xl bg-blue-600 px-4 py-3" onPress={() => router.push("./sessions")}>
            <Text className="text-center font-semibold text-white">Start Session</Text>
          </Pressable>
          <Pressable
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3"
            onPress={() => setIsAddingSubject((prev) => !prev)}
          >
            <Text className="text-center font-semibold text-slate-800">Add Subject</Text>
          </Pressable>
        </View>

        {isAddingSubject ? (
          <View className="mt-3 flex-row gap-2">
            <TextInput
              value={subjectName}
              onChangeText={setSubjectName}
              placeholder="Subject name"
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2"
            />
            <Pressable className="rounded-xl bg-slate-900 px-4 py-2" onPress={handleAddSubject}>
              <Text className="font-semibold text-white">Save</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View className="rounded-2xl border border-slate-200 bg-white p-4">
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
              <View key={session.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: session.subjectColor }} />
                    <Text className="font-medium text-slate-800">{session.subjectName}</Text>
                  </View>
                  <Text className="text-sm text-slate-500">{formatDuration(session.durationSec)}</Text>
                </View>
                <Text className="mt-1 text-xs uppercase text-slate-500">
                  {new Date(session.endedAt).toLocaleDateString()} - {session.mode}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
