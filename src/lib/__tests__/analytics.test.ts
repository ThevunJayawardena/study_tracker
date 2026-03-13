import { describe, expect, test } from "bun:test";
import { getStreak, getSubjectBreakdown, getWeeklySummary } from "@/lib/analytics";
import { StudySession, Subject } from "@/lib/types";

function makeSession(overrides: Partial<StudySession>): StudySession {
  return {
    id: `s-${Math.random()}`,
    subjectId: "sub-1",
    startedAt: "2026-03-10T10:00:00.000Z",
    endedAt: "2026-03-10T10:30:00.000Z",
    durationSec: 1800,
    mode: "manual",
    completedPomodoroCycles: 0,
    ...overrides,
  };
}

describe("analytics", () => {
  test("calculates streak across consecutive days", () => {
    const now = new Date("2026-03-13T10:00:00.000Z");
    const sessions = [
      makeSession({ endedAt: "2026-03-13T08:00:00.000Z" }),
      makeSession({ endedAt: "2026-03-12T08:00:00.000Z" }),
      makeSession({ endedAt: "2026-03-11T08:00:00.000Z" }),
      makeSession({ endedAt: "2026-03-09T08:00:00.000Z" }),
    ];

    expect(getStreak(sessions, now)).toBe(3);
  });

  test("aggregates weekly summary", () => {
    const now = new Date("2026-03-13T10:00:00.000Z");
    const sessions = [
      makeSession({ endedAt: "2026-03-10T08:00:00.000Z", durationSec: 1200 }),
      makeSession({ endedAt: "2026-03-11T08:00:00.000Z", durationSec: 1800 }),
      makeSession({ endedAt: "2026-03-01T08:00:00.000Z", durationSec: 5000 }),
    ];

    const summary = getWeeklySummary(sessions, now);
    expect(summary.sessionCount).toBe(2);
    expect(summary.totalDurationSec).toBe(3000);
  });

  test("builds subject breakdown with percentages", () => {
    const subjects: Subject[] = [
      { id: "sub-1", name: "Math", color: "#111111", createdAt: "2026-03-01T00:00:00.000Z" },
      { id: "sub-2", name: "Physics", color: "#222222", createdAt: "2026-03-01T00:00:00.000Z" },
    ];

    const sessions = [
      makeSession({ subjectId: "sub-1", durationSec: 1800 }),
      makeSession({ subjectId: "sub-2", durationSec: 3600 }),
    ];

    const data = getSubjectBreakdown(sessions, subjects, {
      start: new Date("2026-03-01T00:00:00.000Z"),
      end: new Date("2026-03-31T23:59:59.999Z"),
    });

    expect(data[0].subjectName).toBe("Physics");
    expect(data[0].percentage).toBe(67);
    expect(data[1].subjectName).toBe("Math");
    expect(data[1].percentage).toBe(33);
  });
});
