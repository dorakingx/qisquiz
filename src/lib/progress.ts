import { EXAM_TOTAL_QUESTIONS, isPassingRawScore } from "@/config/exam";
import type {
  ChoiceId,
  Difficulty,
  MockExamAttempt,
  QuestionPerformance,
  QuizAnswer,
  QuizQuestion,
  StudyProgress,
} from "@/types/quiz";
import { CHOICE_IDS, isCodeQuestion } from "@/types/quiz";

/** Current schema key. The v1 key is read once and migrated, never deleted. */
export const STORAGE_KEY = "qisquiz.studyProgress.v2";
export const LEGACY_STORAGE_KEY_V1 = "qisquiz.studyProgress.v1";

/**
 * Minimum answered questions before a tag, section, or type is described as a
 * strength or weakness. One answer is not evidence.
 */
export const MIN_SAMPLE_FOR_INSIGHT = 5;

export type AccuracyBucket = {
  correct: number;
  total: number;
  accuracy: number;
};

export type ProgressStats = {
  /** Distinct questions the learner has answered at least once. */
  uniqueQuestionsAttempted: number;
  /** Every answer ever recorded, including repeats of the same question. */
  totalAttempts: number;
  /** Accuracy counting only each question's first attempt. */
  firstAttemptAccuracy: number;
  /** Accuracy counting every attempt. */
  allAttemptAccuracy: number;
  /** Fraction of the whole bank seen at least once, as a percentage. */
  coveragePercent: number;
  bankSize: number;
  answeredIds: Set<string>;
  missedIds: Set<string>;
  bookmarkedIds: Set<string>;
  sectionAccuracy: Record<number, AccuracyBucket>;
  difficultyAccuracy: Record<Difficulty, AccuracyBucket>;
  tagAccuracy: Record<string, AccuracyBucket>;
  questionTypeAccuracy: Record<string, AccuracyBucket>;
  codeAccuracy: { code: AccuracyBucket; nonCode: AccuracyBucket };
  mostMissedQuestions: { question: QuizQuestion; misses: number }[];
  /** Only areas with at least MIN_SAMPLE_FOR_INSIGHT attempts. */
  weakestTags: { tag: string; accuracy: number; total: number }[];
  /** Sections never attempted, distinct from sections with low accuracy. */
  notAttemptedSections: number[];
  suggestedSection: number | null;
  latestMockAttempt: MockExamAttempt | null;
};

export function createEmptyProgress(): StudyProgress {
  return {
    version: 2,
    answeredQuestionIds: [],
    missedQuestionIds: [],
    bookmarkedQuestionIds: [],
    questionHistory: {},
    lastSelectedSection: "all",
    lastSelectedDifficulty: "all",
    mockExamAttempts: [],
    bestRawScore: 0,
    latestRawScore: 0,
    updatedAt: new Date().toISOString(),
  };
}

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function unique(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(
    new Set(values.filter((value): value is string => typeof value === "string")),
  );
}

function emptyBucket(): AccuracyBucket {
  return { correct: 0, total: 0, accuracy: 0 };
}

function accuracy(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

function isChoiceId(value: unknown): value is ChoiceId {
  return typeof value === "string" && (CHOICE_IDS as string[]).includes(value);
}

function normalizeAnswer(value: unknown): QuizAnswer | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.questionId !== "string") return null;
  return {
    questionId: record.questionId,
    selectedChoiceId: isChoiceId(record.selectedChoiceId)
      ? record.selectedChoiceId
      : null,
    isCorrect: record.isCorrect === true,
  };
}

function normalizePerformance(
  questionId: string,
  value: unknown,
): QuestionPerformance | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const attempts = Number(record.attempts);
  const correct = Number(record.correct);
  if (!Number.isFinite(attempts) || attempts < 0) return null;
  const safeCorrect = Number.isFinite(correct)
    ? Math.min(Math.max(correct, 0), attempts)
    : 0;
  const incorrect = Number(record.incorrect);
  return {
    questionId,
    attempts: Math.floor(attempts),
    correct: Math.floor(safeCorrect),
    incorrect: Number.isFinite(incorrect)
      ? Math.floor(Math.min(Math.max(incorrect, 0), attempts))
      : Math.floor(attempts - safeCorrect),
    firstAttemptCorrect: record.firstAttemptCorrect === true,
    lastSelectedChoiceId: isChoiceId(record.lastSelectedChoiceId)
      ? record.lastSelectedChoiceId
      : record.lastSelectedChoiceId === "legacy-unknown"
        ? "legacy-unknown"
        : null,
    lastAnsweredAt:
      typeof record.lastAnsweredAt === "string"
        ? record.lastAnsweredAt
        : new Date(0).toISOString(),
  };
}

function normalizeAttempt(value: unknown): MockExamAttempt | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const score = Number(record.score);
  const total = Number(record.total);
  if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
    return null;
  }
  const answers = Array.isArray(record.answers)
    ? record.answers
        .map(normalizeAnswer)
        .filter((answer): answer is QuizAnswer => answer !== null)
    : [];
  return {
    id: typeof record.id === "string" ? record.id : `mock-${score}-${total}`,
    completedAt:
      typeof record.completedAt === "string"
        ? record.completedAt
        : new Date(0).toISOString(),
    questionIds: unique(record.questionIds),
    markedQuestionIds: unique(record.markedQuestionIds),
    answers,
    score: Math.floor(score),
    total: Math.floor(total),
    percentage: accuracy(score, total),
    // Always recompute from the raw score so a stored value can never
    // contradict the official criterion.
    passed: isPassingRawScore(Math.floor(score), Math.floor(total)),
    durationSeconds: Number.isFinite(Number(record.durationSeconds))
      ? Number(record.durationSeconds)
      : 0,
    submittedByTimeout: record.submittedByTimeout === true,
  };
}

/**
 * Migrate a version 1 record.
 *
 * v1 stored `lastSelectedIndex`, a position in a rotated choice array that no
 * longer exists. That index cannot be mapped to a stable choice id, so it is
 * recorded as `"legacy-unknown"` rather than being reinterpreted as a
 * different answer. Aggregate counts, bookmarks, and mock attempts are kept.
 */
export function migrateFromV1(value: unknown): StudyProgress {
  const base = createEmptyProgress();
  if (!value || typeof value !== "object") return base;
  const legacy = value as Record<string, unknown>;

  const questionHistory: Record<string, QuestionPerformance> = {};
  const legacyHistory =
    legacy.questionHistory && typeof legacy.questionHistory === "object"
      ? (legacy.questionHistory as Record<string, unknown>)
      : {};

  for (const [questionId, entry] of Object.entries(legacyHistory)) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const attempts = Number(record.attempts);
    if (!Number.isFinite(attempts) || attempts <= 0) continue;
    const correct = Number.isFinite(Number(record.correct))
      ? Math.min(Math.max(Number(record.correct), 0), attempts)
      : 0;
    questionHistory[questionId] = {
      questionId,
      attempts: Math.floor(attempts),
      correct: Math.floor(correct),
      incorrect: Math.floor(attempts - correct),
      // v1 never recorded whether the first attempt was correct. Treating a
      // question as first-attempt correct only when every attempt was correct
      // is the conservative reading of the data we have.
      firstAttemptCorrect: correct === attempts,
      lastSelectedChoiceId: "legacy-unknown",
      lastAnsweredAt:
        typeof record.lastAnsweredAt === "string"
          ? record.lastAnsweredAt
          : new Date(0).toISOString(),
    };
  }

  const attempts = Array.isArray(legacy.mockExamAttempts)
    ? legacy.mockExamAttempts
        .map(normalizeAttempt)
        .filter((attempt): attempt is MockExamAttempt => attempt !== null)
    : [];

  return {
    ...base,
    answeredQuestionIds: unique(legacy.answeredQuestionIds),
    missedQuestionIds: unique(legacy.missedQuestionIds),
    bookmarkedQuestionIds: unique(legacy.bookmarkedQuestionIds),
    questionHistory,
    lastSelectedSection:
      typeof legacy.lastSelectedSection === "number" ||
      legacy.lastSelectedSection === "all"
        ? (legacy.lastSelectedSection as number | "all")
        : "all",
    lastSelectedDifficulty:
      legacy.lastSelectedDifficulty === "easy" ||
      legacy.lastSelectedDifficulty === "medium" ||
      legacy.lastSelectedDifficulty === "hard"
        ? legacy.lastSelectedDifficulty
        : "all",
    mockExamAttempts: attempts,
    bestRawScore: attempts.reduce((max, item) => Math.max(max, item.score), 0),
    latestRawScore: attempts[0]?.score ?? 0,
    migratedFrom: 1,
  };
}

export function normalizeProgress(value: unknown): StudyProgress {
  if (!value || typeof value !== "object") return createEmptyProgress();
  const record = value as Record<string, unknown>;

  if (record.version !== 2) {
    return migrateFromV1(record);
  }

  const base = createEmptyProgress();
  const questionHistory: Record<string, QuestionPerformance> = {};
  const rawHistory =
    record.questionHistory && typeof record.questionHistory === "object"
      ? (record.questionHistory as Record<string, unknown>)
      : {};
  for (const [questionId, entry] of Object.entries(rawHistory)) {
    const normalized = normalizePerformance(questionId, entry);
    if (normalized) questionHistory[questionId] = normalized;
  }

  const attempts = Array.isArray(record.mockExamAttempts)
    ? record.mockExamAttempts
        .map(normalizeAttempt)
        .filter((attempt): attempt is MockExamAttempt => attempt !== null)
    : [];

  return {
    ...base,
    answeredQuestionIds: unique(record.answeredQuestionIds),
    missedQuestionIds: unique(record.missedQuestionIds),
    bookmarkedQuestionIds: unique(record.bookmarkedQuestionIds),
    questionHistory,
    lastSelectedSection:
      typeof record.lastSelectedSection === "number" ||
      record.lastSelectedSection === "all"
        ? (record.lastSelectedSection as number | "all")
        : "all",
    lastSelectedDifficulty:
      record.lastSelectedDifficulty === "easy" ||
      record.lastSelectedDifficulty === "medium" ||
      record.lastSelectedDifficulty === "hard"
        ? record.lastSelectedDifficulty
        : "all",
    mockExamAttempts: attempts,
    bestRawScore: attempts.reduce((max, item) => Math.max(max, item.score), 0),
    latestRawScore: attempts[0]?.score ?? 0,
    updatedAt:
      typeof record.updatedAt === "string" ? record.updatedAt : base.updatedAt,
    migratedFrom:
      typeof record.migratedFrom === "number" ? record.migratedFrom : undefined,
  };
}

export function loadProgress(): StudyProgress {
  if (!canUseStorage()) return createEmptyProgress();

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return createEmptyProgress();
  }

  if (raw) {
    try {
      return normalizeProgress(JSON.parse(raw));
    } catch {
      // Corrupted v2 payload: fall through and try the legacy key rather than
      // silently discarding whatever history may still exist there.
    }
  }

  try {
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY_V1);
    if (!legacy) return createEmptyProgress();
    const migrated = migrateFromV1(JSON.parse(legacy));
    // Persist the migrated copy, but leave the v1 key in place so a rollback
    // does not lose the user's history.
    return saveProgress(migrated);
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(progress: StudyProgress): StudyProgress {
  const next: StudyProgress = {
    ...progress,
    version: 2,
    answeredQuestionIds: unique(progress.answeredQuestionIds),
    missedQuestionIds: unique(progress.missedQuestionIds),
    bookmarkedQuestionIds: unique(progress.bookmarkedQuestionIds),
    updatedAt: new Date().toISOString(),
  };
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage may be full or blocked; keep the in-memory value usable.
    }
  }
  return next;
}

export function clearProgress(): StudyProgress {
  if (canUseStorage()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY_V1);
    } catch {
      // ignore
    }
  }
  return createEmptyProgress();
}

export function recordStudyAnswer(
  progress: StudyProgress,
  question: QuizQuestion,
  selectedChoiceId: ChoiceId,
): StudyProgress {
  const isCorrect = selectedChoiceId === question.correctChoiceId;
  const previous = progress.questionHistory[question.id];
  const now = new Date().toISOString();

  const missed = new Set(progress.missedQuestionIds);
  if (isCorrect) {
    missed.delete(question.id);
  } else {
    missed.add(question.id);
  }

  const performance: QuestionPerformance = {
    questionId: question.id,
    attempts: (previous?.attempts ?? 0) + 1,
    correct: (previous?.correct ?? 0) + (isCorrect ? 1 : 0),
    incorrect: (previous?.incorrect ?? 0) + (isCorrect ? 0 : 1),
    firstAttemptCorrect: previous ? previous.firstAttemptCorrect : isCorrect,
    lastSelectedChoiceId: selectedChoiceId,
    lastAnsweredAt: now,
  };

  return saveProgress({
    ...progress,
    answeredQuestionIds: unique([...progress.answeredQuestionIds, question.id]),
    missedQuestionIds: Array.from(missed),
    questionHistory: {
      ...progress.questionHistory,
      [question.id]: performance,
    },
  });
}

export function recordStudyPreference(
  progress: StudyProgress,
  section: number | "all",
  difficulty: Difficulty | "all",
): StudyProgress {
  return saveProgress({
    ...progress,
    lastSelectedSection: section,
    lastSelectedDifficulty: difficulty,
  });
}

export function toggleBookmark(
  progress: StudyProgress,
  questionId: string,
): StudyProgress {
  const bookmarked = new Set(progress.bookmarkedQuestionIds);
  if (bookmarked.has(questionId)) {
    bookmarked.delete(questionId);
  } else {
    bookmarked.add(questionId);
  }
  return saveProgress({
    ...progress,
    bookmarkedQuestionIds: Array.from(bookmarked),
  });
}

export function recordMockExamAttempt(
  progress: StudyProgress,
  attempt: MockExamAttempt,
  questions: QuizQuestion[],
): StudyProgress {
  const byId = new Map(questions.map((question) => [question.id, question]));
  let next = progress;
  for (const answer of attempt.answers) {
    const question = byId.get(answer.questionId);
    if (question && answer.selectedChoiceId) {
      next = recordStudyAnswer(next, question, answer.selectedChoiceId);
    }
  }

  return saveProgress({
    ...next,
    mockExamAttempts: [attempt, ...next.mockExamAttempts].slice(0, 20),
    latestRawScore: attempt.score,
    bestRawScore: Math.max(next.bestRawScore, attempt.score),
  });
}

function addTo(bucket: AccuracyBucket, correct: number, total: number): void {
  bucket.correct += correct;
  bucket.total += total;
  bucket.accuracy = accuracy(bucket.correct, bucket.total);
}

export function buildProgressStats(
  progress: StudyProgress,
  questions: QuizQuestion[],
): ProgressStats {
  const answeredIds = new Set(progress.answeredQuestionIds);
  const missedIds = new Set(progress.missedQuestionIds);
  const bookmarkedIds = new Set(progress.bookmarkedQuestionIds);

  const sectionAccuracy: Record<number, AccuracyBucket> = {};
  const difficultyAccuracy: Record<Difficulty, AccuracyBucket> = {
    easy: emptyBucket(),
    medium: emptyBucket(),
    hard: emptyBucket(),
  };
  const tagAccuracy: Record<string, AccuracyBucket> = {};
  const questionTypeAccuracy: Record<string, AccuracyBucket> = {};
  const codeAccuracy = { code: emptyBucket(), nonCode: emptyBucket() };
  const mostMissedQuestions: ProgressStats["mostMissedQuestions"] = [];

  let totalAttempts = 0;
  let totalCorrect = 0;
  let firstAttemptTotal = 0;
  let firstAttemptCorrect = 0;
  const attemptedSections = new Set<number>();

  for (const question of questions) {
    const history = progress.questionHistory[question.id];
    if (!history || history.attempts === 0) continue;

    attemptedSections.add(question.section);
    totalAttempts += history.attempts;
    totalCorrect += history.correct;
    firstAttemptTotal += 1;
    if (history.firstAttemptCorrect) firstAttemptCorrect += 1;

    sectionAccuracy[question.section] ??= emptyBucket();
    addTo(sectionAccuracy[question.section], history.correct, history.attempts);

    addTo(difficultyAccuracy[question.difficulty], history.correct, history.attempts);

    questionTypeAccuracy[question.questionType] ??= emptyBucket();
    addTo(
      questionTypeAccuracy[question.questionType],
      history.correct,
      history.attempts,
    );

    const codeBucket = isCodeQuestion(question)
      ? codeAccuracy.code
      : codeAccuracy.nonCode;
    addTo(codeBucket, history.correct, history.attempts);

    for (const tag of question.tags) {
      tagAccuracy[tag] ??= emptyBucket();
      addTo(tagAccuracy[tag], history.correct, history.attempts);
    }

    if (history.incorrect > 0) {
      mostMissedQuestions.push({ question, misses: history.incorrect });
    }
  }

  const weakestTags = Object.entries(tagAccuracy)
    .filter(([, value]) => value.total >= MIN_SAMPLE_FOR_INSIGHT)
    .map(([tag, value]) => ({ tag, accuracy: value.accuracy, total: value.total }))
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total)
    .slice(0, 8);

  const notAttemptedSections = Array.from(
    new Set(questions.map((question) => question.section)),
  )
    .filter((section) => !attemptedSections.has(section))
    .sort((a, b) => a - b);

  const suggestedSection =
    Object.entries(sectionAccuracy)
      .filter(([, value]) => value.total >= MIN_SAMPLE_FOR_INSIGHT)
      .sort(([, a], [, b]) => a.accuracy - b.accuracy || b.total - a.total)
      .map(([section]) => Number.parseInt(section, 10))[0] ??
    notAttemptedSections[0] ??
    null;

  return {
    uniqueQuestionsAttempted: firstAttemptTotal,
    totalAttempts,
    firstAttemptAccuracy: accuracy(firstAttemptCorrect, firstAttemptTotal),
    allAttemptAccuracy: accuracy(totalCorrect, totalAttempts),
    coveragePercent: accuracy(firstAttemptTotal, questions.length),
    bankSize: questions.length,
    answeredIds,
    missedIds,
    bookmarkedIds,
    sectionAccuracy,
    difficultyAccuracy,
    tagAccuracy,
    questionTypeAccuracy,
    codeAccuracy,
    mostMissedQuestions: mostMissedQuestions
      .sort((a, b) => b.misses - a.misses)
      .slice(0, 10),
    weakestTags,
    notAttemptedSections,
    suggestedSection,
    latestMockAttempt: progress.mockExamAttempts[0] ?? null,
  };
}

/**
 * Score a mock exam attempt.
 *
 * Unanswered questions count as incorrect: the score is the number of answers
 * that match the question's `correctChoiceId`, out of the full sitting length.
 */
export function buildMockAttempt(
  questions: QuizQuestion[],
  answers: Record<string, ChoiceId>,
  markedQuestionIds: string[],
  durationSeconds: number,
  submittedByTimeout: boolean,
  attemptId?: string,
): MockExamAttempt {
  const normalizedAnswers: QuizAnswer[] = questions.map((question) => {
    const selectedChoiceId = answers[question.id] ?? null;
    return {
      questionId: question.id,
      selectedChoiceId,
      isCorrect: selectedChoiceId === question.correctChoiceId,
    };
  });

  const score = normalizedAnswers.filter((answer) => answer.isCorrect).length;
  const total = questions.length;

  return {
    id: attemptId ?? `mock-${Date.now()}`,
    completedAt: new Date().toISOString(),
    questionIds: questions.map((question) => question.id),
    markedQuestionIds,
    answers: normalizedAnswers,
    score,
    total,
    percentage: accuracy(score, total),
    passed: isPassingRawScore(score, total),
    durationSeconds,
    submittedByTimeout,
  };
}

export { EXAM_TOTAL_QUESTIONS };
