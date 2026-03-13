import { StudySession, Subject } from "@/lib/types";
import { getDayKey, getWeekRange } from "@/lib/time";

export interface Summary {
  totalDurationSec: number;
  sessionCount: number;
}

export interface SubjectBreakdownItem {
  subjectId: string;
  subjectName: string;
  color: string;
  durationSec: number;
  percentage: number;
}

export function getTodaySummary(sessions: StudySession[], now = new Date()): Summary {
  const todayKey = getDayKey(now);
  const todaySessions = sessions.filter((session) => getDayKey(session.endedAt) === todayKey);

  return {
    totalDurationSec: todaySessions.reduce((sum, session) => sum + session.durationSec, 0),
    sessionCount: todaySessions.length,
  };
}

export function getWeeklySummary(sessions: StudySession[], now = new Date()): Summary & { start: Date; end: Date } {
  const { start, end } = getWeekRange(now);
  const weeklySessions = sessions.filter((session) => {
    const endedAt = new Date(session.endedAt);
    return endedAt >= start && endedAt <= end;
  });

  return {
    totalDurationSec: weeklySessions.reduce((sum, session) => sum + session.durationSec, 0),
    sessionCount: weeklySessions.length,
    start,
    end,
  };
}

export function getSubjectBreakdown(
  sessions: StudySession[],
  subjects: Subject[],
  range: { start: Date; end: Date }
): SubjectBreakdownItem[] {
  const inRange = sessions.filter((session) => {
    const endedAt = new Date(session.endedAt);
    return endedAt >= range.start && endedAt <= range.end;
  });

  const bySubject = new Map<string, number>();
  for (const session of inRange) {
    bySubject.set(session.subjectId, (bySubject.get(session.subjectId) ?? 0) + session.durationSec);
  }

  const total = Array.from(bySubject.values()).reduce((sum, value) => sum + value, 0);

  return Array.from(bySubject.entries())
    .map(([subjectId, durationSec]) => {
      const subject = subjects.find((item) => item.id === subjectId);
      return {
        subjectId,
        subjectName: subject?.name ?? "Unknown",
        color: subject?.color ?? "#6b7280",
        durationSec,
        percentage: total > 0 ? Math.round((durationSec / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.durationSec - a.durationSec);
}

export function getStreak(sessions: StudySession[], now = new Date()): number {
  const studiedDays = new Set(
    sessions.filter((session) => session.durationSec > 0).map((session) => getDayKey(session.endedAt))
  );

  if (studiedDays.size === 0) return 0;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let cursor = studiedDays.has(getDayKey(today)) ? today : studiedDays.has(getDayKey(yesterday)) ? yesterday : null;
  if (!cursor) return 0;

  let streak = 0;
  while (studiedDays.has(getDayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
