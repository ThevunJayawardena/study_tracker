export type SessionMode = "pomodoro" | "manual";

export interface Subject {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  mode: SessionMode;
  completedPomodoroCycles: number;
}

export interface UserSettings {
  dailyGoalMin: number;
  pomodoroFocusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  longBreakEvery: number;
  remindersEnabled: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  dailyGoalMin: 120,
  pomodoroFocusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  longBreakEvery: 4,
  remindersEnabled: false,
};

export const SUBJECT_COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#d97706",
  "#7c3aed",
  "#0f766e",
];
