import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadSessions, loadSettings, loadSubjects, resetAllData, saveSessions, saveSettings, saveSubjects } from "@/lib/storage";
import { DEFAULT_SETTINGS, StudySession, Subject, SUBJECT_COLORS, UserSettings } from "@/lib/types";

interface AppDataContextValue {
  isLoading: boolean;
  subjects: Subject[];
  sessions: StudySession[];
  settings: UserSettings;
  addSubject: (name: string, color?: string) => Promise<void>;
  addSession: (session: Omit<StudySession, "id">) => Promise<void>;
  updateSettings: (next: Partial<UserSettings>) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function AppDataProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [loadedSubjects, loadedSessions, loadedSettings] = await Promise.all([
        loadSubjects(),
        loadSessions(),
        loadSettings(),
      ]);

      if (!mounted) return;
      setSubjects(loadedSubjects);
      setSessions(loadedSessions.sort((a, b) => +new Date(b.endedAt) - +new Date(a.endedAt)));
      setSettings(loadedSettings);
      setIsLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const addSubject = useCallback(async (name: string, color?: string): Promise<void> => {
    const trimmed = name.trim();
    if (!trimmed) return;

    let nextSubjects: Subject[] = [];
    setSubjects((prev) => {
      const nextSubject: Subject = {
        id: createId("subject"),
        name: trimmed,
        color: color ?? SUBJECT_COLORS[prev.length % SUBJECT_COLORS.length],
        createdAt: new Date().toISOString(),
      };

      nextSubjects = [nextSubject, ...prev];
      return nextSubjects;
    });

    await saveSubjects(nextSubjects);
  }, []);

  const addSession = useCallback(async (session: Omit<StudySession, "id">): Promise<void> => {
    let nextSessions: StudySession[] = [];

    setSessions((prev) => {
      const nextSession: StudySession = {
        id: createId("session"),
        ...session,
      };
      nextSessions = [nextSession, ...prev];
      return nextSessions;
    });

    await saveSessions(nextSessions);
  }, []);

  const updateSettings = useCallback(async (next: Partial<UserSettings>): Promise<void> => {
    let merged: UserSettings = DEFAULT_SETTINGS;
    setSettings((prev) => {
      merged = { ...prev, ...next };
      return merged;
    });

    await saveSettings(merged);
  }, []);

  const clearAllData = useCallback(async (): Promise<void> => {
    await resetAllData();
    setSubjects([]);
    setSessions([]);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      subjects,
      sessions,
      settings,
      addSubject,
      addSession,
      updateSettings,
      clearAllData,
    }),
    [isLoading, subjects, sessions, settings, addSubject, addSession, updateSettings, clearAllData]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used inside AppDataProvider");
  }

  return ctx;
}
