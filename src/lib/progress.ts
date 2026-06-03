import type {
  Difficulty,
  MockExamAttempt,
  QuizAnswer,
  QuizQuestion,
  StudyProgress,
} from "@/types/quiz";

const STORAGE_KEY = "qisquiz.studyProgress.v1";

export type ProgressStats = {
  totalAnswered: number;
  overallAccuracy: number;
  answeredIds: Set<string>;
  missedIds: Set<string>;
  bookmarkedIds: Set<string>;
  sectionAccuracy: Record<number, { correct: number; total: number; accuracy: number }>;
  difficultyAccuracy: Record<Difficulty, { correct: number; total: number; accuracy: number }>;
  tagAccuracy: Record<string, { correct: number; total: number; accuracy: number }>;
  mostMissedQuestions: { question: QuizQuestion; misses: number }[];
  weakestTags: { tag: string; accuracy: number; total: number }[];
  suggestedSection: number | null;
};

export function createEmptyProgress(): StudyProgress {
  return {
    version: 1,
    answeredQuestionIds: [],
    missedQuestionIds: [],
    bookmarkedQuestionIds: [],
    questionHistory: {},
    sectionAccuracy: {},
    tagAccuracy: {},
    lastSelectedSection: "all",
    lastSelectedDifficulty: "all",
    mockExamAttempts: [],
    bestScore: 0,
    latestScore: 0,
    updatedAt: new Date().toISOString(),
  };
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function normalizeProgress(value: unknown): StudyProgress {
  if (!value || typeof value !== "object") return createEmptyProgress();
  const progress = value as Partial<StudyProgress>;
  return {
    ...createEmptyProgress(),
    ...progress,
    version: 1,
    answeredQuestionIds: unique(progress.answeredQuestionIds ?? []),
    missedQuestionIds: unique(progress.missedQuestionIds ?? []),
    bookmarkedQuestionIds: unique(progress.bookmarkedQuestionIds ?? []),
    questionHistory: progress.questionHistory ?? {},
    sectionAccuracy: progress.sectionAccuracy ?? {},
    tagAccuracy: progress.tagAccuracy ?? {},
    mockExamAttempts: progress.mockExamAttempts ?? [],
  };
}

export function loadProgress(): StudyProgress {
  if (!canUseStorage()) return createEmptyProgress();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createEmptyProgress();

  try {
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(progress: StudyProgress): StudyProgress {
  const next = {
    ...progress,
    answeredQuestionIds: unique(progress.answeredQuestionIds),
    missedQuestionIds: unique(progress.missedQuestionIds),
    bookmarkedQuestionIds: unique(progress.bookmarkedQuestionIds),
    updatedAt: new Date().toISOString(),
  };
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function clearProgress(): StudyProgress {
  if (canUseStorage()) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return createEmptyProgress();
}

export function recordStudyAnswer(
  progress: StudyProgress,
  question: QuizQuestion,
  selectedIndex: number,
): StudyProgress {
  const isCorrect = selectedIndex === question.correctAnswerIndex;
  const correctIncrement = isCorrect ? 1 : 0;
  const previous = progress.questionHistory[question.id] ?? {
    questionId: question.id,
    attempts: 0,
    correct: 0,
    incorrect: 0,
    lastSelectedIndex: selectedIndex,
    lastAnsweredAt: new Date().toISOString(),
  };
  const missed = new Set(progress.missedQuestionIds);
  if (isCorrect) {
    missed.delete(question.id);
  } else {
    missed.add(question.id);
  }
  const sectionKey = String(question.section);
  const currentSection = progress.sectionAccuracy[sectionKey] ?? emptyBucket();
  const nextSection = {
    correct: currentSection.correct + correctIncrement,
    total: currentSection.total + 1,
    accuracy: accuracy(currentSection.correct + correctIncrement, currentSection.total + 1),
  };
  const nextTagAccuracy = { ...progress.tagAccuracy };
  for (const tag of question.tags) {
    const currentTag = nextTagAccuracy[tag] ?? emptyBucket();
    nextTagAccuracy[tag] = {
      correct: currentTag.correct + correctIncrement,
      total: currentTag.total + 1,
      accuracy: accuracy(currentTag.correct + correctIncrement, currentTag.total + 1),
    };
  }

  return saveProgress({
    ...progress,
    answeredQuestionIds: unique([...progress.answeredQuestionIds, question.id]),
    missedQuestionIds: Array.from(missed),
    questionHistory: {
      ...progress.questionHistory,
      [question.id]: {
        ...previous,
        attempts: previous.attempts + 1,
        correct: previous.correct + correctIncrement,
        incorrect: previous.incorrect + (isCorrect ? 0 : 1),
        lastSelectedIndex: selectedIndex,
        lastAnsweredAt: new Date().toISOString(),
      },
    },
    sectionAccuracy: {
      ...progress.sectionAccuracy,
      [sectionKey]: nextSection,
    },
    tagAccuracy: nextTagAccuracy,
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
  let next = progress;
  for (const answer of attempt.answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (question) {
      next = recordStudyAnswer(next, question, answer.selectedIndex);
    }
  }

  return saveProgress({
    ...next,
    mockExamAttempts: [attempt, ...next.mockExamAttempts].slice(0, 20),
    latestScore: attempt.percentage,
    bestScore: Math.max(next.bestScore, attempt.percentage),
  });
}

function emptyBucket() {
  return { correct: 0, total: 0, accuracy: 0 };
}

function accuracy(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export function buildProgressStats(
  progress: StudyProgress,
  questions: QuizQuestion[],
): ProgressStats {
  const answeredIds = new Set(progress.answeredQuestionIds);
  const missedIds = new Set(progress.missedQuestionIds);
  const bookmarkedIds = new Set(progress.bookmarkedQuestionIds);
  const sectionAccuracy: ProgressStats["sectionAccuracy"] = {};
  const difficultyAccuracy: ProgressStats["difficultyAccuracy"] = {
    easy: emptyBucket(),
    medium: emptyBucket(),
    hard: emptyBucket(),
  };
  const tagAccuracy: ProgressStats["tagAccuracy"] = {};
  const mostMissedQuestions: ProgressStats["mostMissedQuestions"] = [];

  for (const question of questions) {
    const history = progress.questionHistory[question.id];
    if (!history) continue;

    const sectionBucket = sectionAccuracy[question.section] ?? emptyBucket();
    sectionBucket.correct += history.correct;
    sectionBucket.total += history.attempts;
    sectionBucket.accuracy = accuracy(sectionBucket.correct, sectionBucket.total);
    sectionAccuracy[question.section] = sectionBucket;

    const difficultyBucket = difficultyAccuracy[question.difficulty];
    difficultyBucket.correct += history.correct;
    difficultyBucket.total += history.attempts;
    difficultyBucket.accuracy = accuracy(
      difficultyBucket.correct,
      difficultyBucket.total,
    );

    for (const tag of question.tags) {
      const tagBucket = tagAccuracy[tag] ?? emptyBucket();
      tagBucket.correct += history.correct;
      tagBucket.total += history.attempts;
      tagBucket.accuracy = accuracy(tagBucket.correct, tagBucket.total);
      tagAccuracy[tag] = tagBucket;
    }

    if (history.incorrect > 0) {
      mostMissedQuestions.push({ question, misses: history.incorrect });
    }
  }

  const totalAttempts = Object.values(progress.questionHistory).reduce(
    (sum, item) => sum + item.attempts,
    0,
  );
  const totalCorrect = Object.values(progress.questionHistory).reduce(
    (sum, item) => sum + item.correct,
    0,
  );

  const weakestTags = Object.entries(tagAccuracy)
    .filter(([, value]) => value.total > 0)
    .map(([tag, value]) => ({ tag, accuracy: value.accuracy, total: value.total }))
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total)
    .slice(0, 8);

  const suggestedSection =
    Object.entries(sectionAccuracy)
      .filter(([, value]) => value.total > 0)
      .sort(([, a], [, b]) => a.accuracy - b.accuracy || b.total - a.total)
      .map(([section]) => Number.parseInt(section, 10))[0] ?? null;

  return {
    totalAnswered: totalAttempts,
    overallAccuracy: accuracy(totalCorrect, totalAttempts),
    answeredIds,
    missedIds,
    bookmarkedIds,
    sectionAccuracy,
    difficultyAccuracy,
    tagAccuracy,
    mostMissedQuestions: mostMissedQuestions
      .sort((a, b) => b.misses - a.misses)
      .slice(0, 10),
    weakestTags,
    suggestedSection,
  };
}

export function buildMockAttempt(
  questions: QuizQuestion[],
  answers: Record<string, number>,
  markedQuestionIds: string[],
  durationSeconds: number,
  submittedByTimeout: boolean,
): MockExamAttempt {
  const normalizedAnswers: QuizAnswer[] = questions
    .filter((question) => answers[question.id] !== undefined)
    .map((question) => ({
      questionId: question.id,
      selectedIndex: answers[question.id],
      isCorrect: answers[question.id] === question.correctAnswerIndex,
    }));
  const score = normalizedAnswers.filter((answer) => answer.isCorrect).length;
  const total = questions.length;

  return {
    id: `mock-${Date.now()}`,
    completedAt: new Date().toISOString(),
    questionIds: questions.map((question) => question.id),
    markedQuestionIds,
    answers: normalizedAnswers,
    score,
    total,
    percentage: accuracy(score, total),
    durationSeconds,
    submittedByTimeout,
  };
}
