import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useAppData } from "@/context/AppDataContext";
import { SessionMode } from "@/lib/types";
import { formatClock, formatDuration } from "@/lib/time";

export default function SessionsScreen() {
  const { subjects, addSubject, addSession, settings } = useAppData();
  const [mode, setMode] = useState<SessionMode>("pomodoro");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "running" | "paused">("idle");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [subjectName, setSubjectName] = useState("");

  useEffect(() => {
    if (subjects.length === 0) {
      setSelectedSubjectId("");
      return;
    }

    if (!selectedSubjectId || !subjects.find((subject) => subject.id === selectedSubjectId)) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    if (status !== "running") return;
    const timer = setInterval(() => setElapsedSec((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  const completedPomodoroCycles = useMemo(() => {
    if (mode !== "pomodoro") return 0;
    const cycleSec = Math.max(1, settings.pomodoroFocusMin) * 60;
    return Math.floor(elapsedSec / cycleSec);
  }, [elapsedSec, mode, settings.pomodoroFocusMin]);

  async function handleAddSubject() {
    if (!subjectName.trim()) return;
    await addSubject(subjectName);
    setSubjectName("");
  }

  async function handleStopSession() {
    if (!selectedSubjectId || elapsedSec <= 0) {
      setStatus("idle");
      setElapsedSec(0);
      return;
    }

    const endedAt = new Date();
    const startedAt = new Date(endedAt.getTime() - elapsedSec * 1000);

    await addSession({
      subjectId: selectedSubjectId,
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      durationSec: elapsedSec,
      mode,
      completedPomodoroCycles,
    });

    setStatus("idle");
    setElapsedSec(0);
  }

  return (
    <ScrollView className="flex-1 bg-slate-100" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <SectionHeader title="Study Session" subtitle="Run focus blocks or freeform timed sessions." />

      {subjects.length === 0 ? (
        <EmptyState
          title="No subjects yet"
          description="Add a subject first, then start tracking sessions."
          action={
            <View className="flex-row gap-2">
              <TextInput
                value={subjectName}
                onChangeText={setSubjectName}
                placeholder="Subject name"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2"
              />
              <Pressable className="rounded-xl bg-slate-900 px-4 py-2" onPress={handleAddSubject}>
                <Text className="font-semibold text-white">Add</Text>
              </Pressable>
            </View>
          }
        />
      ) : (
        <>
          <View className="rounded-2xl border border-slate-200 bg-white p-4">
            <SectionHeader title="Mode" />
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setMode("pomodoro")}
                className={`flex-1 rounded-xl px-4 py-2 ${mode === "pomodoro" ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <Text className={`text-center font-semibold ${mode === "pomodoro" ? "text-white" : "text-slate-700"}`}>
                  Pomodoro
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMode("manual")}
                className={`flex-1 rounded-xl px-4 py-2 ${mode === "manual" ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <Text className={`text-center font-semibold ${mode === "manual" ? "text-white" : "text-slate-700"}`}>
                  Manual
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="rounded-2xl border border-slate-200 bg-white p-4">
            <SectionHeader title="Subject" />
            <View className="flex-row flex-wrap gap-2">
              {subjects.map((subject) => {
                const active = selectedSubjectId === subject.id;
                return (
                  <Pressable
                    key={subject.id}
                    onPress={() => setSelectedSubjectId(subject.id)}
                    className={`rounded-full border px-3 py-1.5 ${active ? "border-blue-600" : "border-slate-300"}`}
                    style={active ? { backgroundColor: `${subject.color}22` } : undefined}
                  >
                    <Text className={`font-medium ${active ? "text-slate-900" : "text-slate-700"}`}>{subject.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="rounded-2xl border border-slate-200 bg-white p-4">
            <SectionHeader title="Timer" />
            <Text className="mb-2 text-center text-5xl font-bold text-slate-900">{formatClock(elapsedSec)}</Text>
            <Text className="mb-4 text-center text-sm text-slate-500">
              {mode === "pomodoro"
                ? `${completedPomodoroCycles} completed cycle${completedPomodoroCycles === 1 ? "" : "s"}`
                : "Freeform elapsed timer"}
            </Text>

            <View className="flex-row gap-2">
              {status === "idle" ? (
                <Pressable className="flex-1 rounded-xl bg-blue-600 px-4 py-3" onPress={() => setStatus("running")}>
                  <Text className="text-center font-semibold text-white">Start</Text>
                </Pressable>
              ) : status === "running" ? (
                <Pressable className="flex-1 rounded-xl bg-amber-500 px-4 py-3" onPress={() => setStatus("paused")}>
                  <Text className="text-center font-semibold text-white">Pause</Text>
                </Pressable>
              ) : (
                <Pressable className="flex-1 rounded-xl bg-blue-600 px-4 py-3" onPress={() => setStatus("running")}>
                  <Text className="text-center font-semibold text-white">Resume</Text>
                </Pressable>
              )}

              <Pressable className="flex-1 rounded-xl bg-slate-900 px-4 py-3" onPress={handleStopSession}>
                <Text className="text-center font-semibold text-white">Stop & Save</Text>
              </Pressable>
            </View>
          </View>

          <StatCard
            label="Current Session"
            value={formatDuration(elapsedSec)}
            helper={selectedSubjectId ? `Subject: ${subjects.find((s) => s.id === selectedSubjectId)?.name}` : undefined}
            accent="#0f766e"
          />
        </>
      )}
    </ScrollView>
  );
}
