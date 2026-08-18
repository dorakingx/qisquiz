import type { ChoiceId, MockExamSessionState, QuizQuestion } from "@/types/quiz";
import { CHOICE_IDS } from "@/types/quiz";
import { EXAM_TIME_LIMIT_SECONDS } from "@/config/exam";
import { buildMockExamSession } from "./quiz";
import { createSeed, shuffleForKey } from "./shuffle";

export const MOCK_SESSION_KEY = "qisquiz.mockExamSession.v2";

function isChoiceId(value: unknown): value is ChoiceId {
  return typeof value === "string" && (CHOICE_IDS as string[]).includes(value);
}

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

/**
 * Create a fresh in-progress exam state.
 *
 * The choice order for every question is frozen up front and stored, so a page
 * refresh restores the exact same presentation. The deadline is absolute, so
 * reloading cannot extend the remaining time.
 */
export function createMockSession(
  bank: readonly QuizQuestion[],
  nowMs: number = Date.now(),
): MockExamSessionState {
  const seed = createSeed();
  const questions = buildMockExamSession(bank);
  const choiceOrder: Record<string, ChoiceId[]> = {};
  for (const question of questions) {
    choiceOrder[question.id] = shuffleForKey(
      question.choices,
      seed,
      question.id,
    ).map((choice) => choice.id);
  }

  return {
    version: 2,
    attemptId: `mock-${nowMs}-${seed.toString(16)}`,
    questionIds: questions.map((question) => question.id),
    choiceOrder,
    answers: {},
    markedQuestionIds: [],
    currentIndex: 0,
    startedAtMs: nowMs,
    deadlineMs: nowMs + EXAM_TIME_LIMIT_SECONDS * 1000,
  };
}

export function normalizeMockSession(value: unknown): MockExamSessionState | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.version !== 2) return null;
  if (!Array.isArray(record.questionIds) || record.questionIds.length === 0) {
    return null;
  }
  const questionIds = record.questionIds.filter(
    (id): id is string => typeof id === "string",
  );
  if (questionIds.length !== record.questionIds.length) return null;

  const deadlineMs = Number(record.deadlineMs);
  const startedAtMs = Number(record.startedAtMs);
  if (!Number.isFinite(deadlineMs) || !Number.isFinite(startedAtMs)) return null;

  const choiceOrder: Record<string, ChoiceId[]> = {};
  const rawOrder =
    record.choiceOrder && typeof record.choiceOrder === "object"
      ? (record.choiceOrder as Record<string, unknown>)
      : {};
  for (const [questionId, order] of Object.entries(rawOrder)) {
    if (!Array.isArray(order)) continue;
    const ids = order.filter(isChoiceId);
    if (ids.length > 0) choiceOrder[questionId] = ids;
  }

  const answers: Record<string, ChoiceId> = {};
  const rawAnswers =
    record.answers && typeof record.answers === "object"
      ? (record.answers as Record<string, unknown>)
      : {};
  for (const [questionId, choiceId] of Object.entries(rawAnswers)) {
    if (isChoiceId(choiceId)) answers[questionId] = choiceId;
  }

  const currentIndex = Number(record.currentIndex);

  return {
    version: 2,
    attemptId:
      typeof record.attemptId === "string" ? record.attemptId : `mock-${startedAtMs}`,
    questionIds,
    choiceOrder,
    answers,
    markedQuestionIds: Array.isArray(record.markedQuestionIds)
      ? record.markedQuestionIds.filter((id): id is string => typeof id === "string")
      : [],
    currentIndex:
      Number.isFinite(currentIndex) && currentIndex >= 0 && currentIndex < questionIds.length
        ? Math.floor(currentIndex)
        : 0,
    startedAtMs,
    deadlineMs,
  };
}

export function loadMockSession(): MockExamSessionState | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(MOCK_SESSION_KEY);
    if (!raw) return null;
    return normalizeMockSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveMockSession(state: MockExamSessionState): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable; the in-memory session still works.
  }
}

export function clearMockSession(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(MOCK_SESSION_KEY);
  } catch {
    // ignore
  }
}

export function remainingSeconds(
  state: MockExamSessionState,
  nowMs: number = Date.now(),
): number {
  return Math.max(0, Math.ceil((state.deadlineMs - nowMs) / 1000));
}

export function elapsedSeconds(
  state: MockExamSessionState,
  nowMs: number = Date.now(),
): number {
  return Math.max(0, Math.round((nowMs - state.startedAtMs) / 1000));
}

/** Resolve a stored session against the current bank, dropping stale ids. */
export function resolveSessionQuestions(
  state: MockExamSessionState,
  bank: readonly QuizQuestion[],
): QuizQuestion[] {
  const byId = new Map(bank.map((question) => [question.id, question]));
  return state.questionIds
    .map((id) => byId.get(id))
    .filter((question): question is QuizQuestion => question !== undefined);
}
