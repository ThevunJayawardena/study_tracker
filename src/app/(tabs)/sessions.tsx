import { Ionicons } from "@expo/vector-icons";
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
    <ScrollView className="flex-1 bg-indigo-50" contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 30 }}>
      <SectionHeader eyebrow="Focus" title="Session Room" subtitle="Run a timer and lock study time to a subject." />

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
                placeholderTextColor="#94a3b8"
                className="flex-1 rounded-2xl border border-slate-300 bg-white px-3 py-2.5"
              />
              <Pressable className="rounded-2xl bg-slate-900 px-4 py-2.5" onPress={handleAddSubject}>
                <Text className="font-bold text-white">Add</Text>
              </Pressable>
            </View>
          }
        />
      ) : (
        <>
          <View className="rounded-3xl border border-slate-200 bg-white p-4">
            <SectionHeader title="Mode" />
            <View className="flex-row gap-2">
              <ModeButton label="Pomodoro" active={mode === "pomodoro"} onPress={() => setMode("pomodoro")} />
              <ModeButton label="Manual" active={mode === "manual"} onPress={() => setMode("manual")} />
            </View>
          </View>

          <View className="rounded-3xl border border-slate-200 bg-white p-4">
            <SectionHeader title="Subject" />
            <View className="flex-row flex-wrap gap-2">
              {subjects.map((subject) => {
                const active = selectedSubjectId === subject.id;
                return (
                  <Pressable
                    key={subject.id}
                    onPress={() => setSelectedSubjectId(subject.id)}
                    className={`rounded-full border px-3 py-1.5 ${active ? "border-indigo-500" : "border-slate-300"}`}
                    style={active ? { backgroundColor: `${subject.color}22` } : undefined}
                  >
                    <Text className={`font-semibold ${active ? "text-slate-900" : "text-slate-700"}`}>{subject.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="overflow-hidden rounded-3xl border border-indigo-200 bg-white p-5">
            <View className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-100" />
            <SectionHeader title="Timer" />
            <View className="items-center">
              <View className="mb-3 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1">
                <Text className="text-xs font-bold uppercase tracking-wider text-indigo-700">{status}</Text>
              </View>
              <Text className="mb-2 text-center text-6xl font-black tracking-tight text-slate-900">{formatClock(elapsedSec)}</Text>
              <Text className="mb-4 text-center text-sm text-slate-600">
                {mode === "pomodoro"
                  ? `${completedPomodoroCycles} completed cycle${completedPomodoroCycles === 1 ? "" : "s"}`
                  : "Freeform elapsed timer"}
              </Text>
            </View>

            <View className="flex-row gap-2">
              {status === "idle" ? (
                <ActionButton label="Start" icon="play" tone="primary" onPress={() => setStatus("running")} />
              ) : status === "running" ? (
                <ActionButton label="Pause" icon="pause" tone="warn" onPress={() => setStatus("paused")} />
              ) : (
                <ActionButton label="Resume" icon="play" tone="primary" onPress={() => setStatus("running")} />
              )}

              <ActionButton label="Stop & Save" icon="save" tone="dark" onPress={handleStopSession} />
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

function ModeButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-2xl px-4 py-2.5 ${active ? "bg-indigo-600" : "bg-slate-100"}`}
    >
      <Text className={`text-center font-bold ${active ? "text-white" : "text-slate-700"}`}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({
  label,
  icon,
  tone,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: "primary" | "warn" | "dark";
  onPress: () => void;
}) {
  const classes = tone === "primary" ? "bg-indigo-600" : tone === "warn" ? "bg-amber-500" : "bg-slate-900";

  return (
    <Pressable className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl px-4 py-3 ${classes}`} onPress={onPress}>
      <Ionicons name={icon} size={15} color="#ffffff" />
      <Text className="text-center font-bold text-white">{label}</Text>
    </Pressable>
  );
}
