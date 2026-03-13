import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useAppData } from "@/context/AppDataContext";
import { getStreak, getSubjectBreakdown, getWeeklySummary } from "@/lib/analytics";
import { formatDuration } from "@/lib/time";

export default function AnalyticsScreen() {
  const { sessions, subjects } = useAppData();

  const weeklySummary = useMemo(() => getWeeklySummary(sessions), [sessions]);
  const streak = useMemo(() => getStreak(sessions), [sessions]);
  const subjectBreakdown = useMemo(
    () => getSubjectBreakdown(sessions, subjects, { start: weeklySummary.start, end: weeklySummary.end }),
    [sessions, subjects, weeklySummary.start, weeklySummary.end]
  );

  return (
    <ScrollView className="flex-1 bg-slate-100" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <SectionHeader
        title="Weekly Analytics"
        subtitle={`Week of ${weeklySummary.start.toLocaleDateString()} to ${weeklySummary.end.toLocaleDateString()}`}
      />

      <View className="flex-row gap-3">
        <StatCard label="Week Time" value={formatDuration(weeklySummary.totalDurationSec)} />
        <StatCard label="Week Sessions" value={String(weeklySummary.sessionCount)} accent="#16a34a" />
      </View>

      <StatCard label="Streak" value={`${streak} day${streak === 1 ? "" : "s"}`} accent="#d97706" />

      <View className="rounded-2xl border border-slate-200 bg-white p-4">
        <SectionHeader title="Subject Breakdown" />
        {subjectBreakdown.length === 0 ? (
          <EmptyState
            title="No study time this week"
            description="Once sessions are logged, weekly subject distribution appears here."
          />
        ) : (
          <View className="gap-2">
            {subjectBreakdown.map((item) => (
              <View key={item.subjectId} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <Text className="font-medium text-slate-800">{item.subjectName}</Text>
                  </View>
                  <Text className="text-sm font-semibold text-slate-700">{item.percentage}%</Text>
                </View>
                <Text className="mt-1 text-sm text-slate-500">{formatDuration(item.durationSec)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
