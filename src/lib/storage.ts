import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_SETTINGS, StudySession, Subject, UserSettings } from "@/lib/types";

const SUBJECTS_KEY = "study.subjects.v1";
const SESSIONS_KEY = "study.sessions.v1";
const SETTINGS_KEY = "study.settings.v1";

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadSubjects(): Promise<Subject[]> {
  return readJson<Subject[]>(SUBJECTS_KEY, []);
}

export async function saveSubjects(subjects: Subject[]): Promise<void> {
  await writeJson(SUBJECTS_KEY, subjects);
}

export async function loadSessions(): Promise<StudySession[]> {
  return readJson<StudySession[]>(SESSIONS_KEY, []);
}

export async function saveSessions(sessions: StudySession[]): Promise<void> {
  await writeJson(SESSIONS_KEY, sessions);
}

export async function loadSettings(): Promise<UserSettings> {
  const loaded = await readJson<Partial<UserSettings>>(SETTINGS_KEY, {});
  return {
    ...DEFAULT_SETTINGS,
    ...loaded,
  };
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await writeJson(SETTINGS_KEY, settings);
}

export async function resetAllData(): Promise<void> {
  await AsyncStorage.multiRemove([SUBJECTS_KEY, SESSIONS_KEY, SETTINGS_KEY]);
}
