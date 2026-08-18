import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  LEGACY_STORAGE_KEY_V1,
  MIN_SAMPLE_FOR_INSIGHT,
  STORAGE_KEY,
  buildProgressStats,
  clearProgress,
  createEmptyProgress,
  loadProgress,
  migrateFromV1,
  normalizeProgress,
  recordStudyAnswer,
  saveProgress,
  toggleBookmark,
} from "@/lib/progress";
import { QUIZ_QUESTIONS } from "@/data/questions";
import type { QuizQuestion } from "@/types/quiz";

/** Minimal in-memory localStorage so the module's guards can be exercised. */
function installStorage(seed: Record<string, string> = {}) {
  const store = new Map(Object.entries(seed));
  const localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
  vi.stubGlobal("window", { localStorage });
  return store;
}

const V1_PAYLOAD = {
  version: 1,
  answeredQuestionIds: ["s1-001", "s2-003", "s8-015"],
  missedQuestionIds: ["s2-003"],
  bookmarkedQuestionIds: ["s1-001"],
  questionHistory: {
    "s1-001": {
      questionId: "s1-001",
      attempts: 3,
      correct: 3,
      incorrect: 0,
      lastSelectedIndex: 2,
      lastAnsweredAt: "2026-01-05T10:00:00.000Z",
    },
    "s2-003": {
      questionId: "s2-003",
      attempts: 2,
      correct: 1,
      incorrect: 1,
      lastSelectedIndex: 0,
      lastAnsweredAt: "2026-01-06T10:00:00.000Z",
    },
  },
  sectionAccuracy: { "1": { correct: 3, total: 3, accuracy: 100 } },
  tagAccuracy: {},
  lastSelectedSection: 2,
  lastSelectedDifficulty: "hard",
  mockExamAttempts: [
    {
      id: "mock-1",
      completedAt: "2026-01-06T11:00:00.000Z",
      questionIds: ["s1-001"],
      markedQuestionIds: [],
      answers: [{ questionId: "s1-001", selectedIndex: 2, isCorrect: true }],
      score: 47,
      total: 68,
      percentage: 69,
      durationSeconds: 3000,
      submittedByTimeout: false,
    },
  ],
  bestScore: 69,
  latestScore: 69,
  updatedAt: "2026-01-06T11:00:00.000Z",
};

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("v1 to v2 migration", () => {
  it("preserves aggregate counts, bookmarks, and preferences", () => {
    const migrated = migrateFromV1(V1_PAYLOAD);
    expect(migrated.version).toBe(2);
    expect(migrated.migratedFrom).toBe(1);
    expect(migrated.answeredQuestionIds).toEqual(["s1-001", "s2-003", "s8-015"]);
    expect(migrated.missedQuestionIds).toEqual(["s2-003"]);
    expect(migrated.bookmarkedQuestionIds).toEqual(["s1-001"]);
    expect(migrated.lastSelectedSection).toBe(2);
    expect(migrated.lastSelectedDifficulty).toBe("hard");
    expect(migrated.questionHistory["s1-001"].attempts).toBe(3);
    expect(migrated.questionHistory["s1-001"].correct).toBe(3);
    expect(migrated.questionHistory["s2-003"].incorrect).toBe(1);
  });

  it("marks an unmappable historical answer as legacy rather than guessing", () => {
    const migrated = migrateFromV1(V1_PAYLOAD);
    expect(migrated.questionHistory["s1-001"].lastSelectedChoiceId).toBe(
      "legacy-unknown",
    );
    expect(migrated.questionHistory["s2-003"].lastSelectedChoiceId).toBe(
      "legacy-unknown",
    );
  });

  it("infers first-attempt correctness conservatively", () => {
    const migrated = migrateFromV1(V1_PAYLOAD);
    // Every attempt was correct, so the first one must have been too.
    expect(migrated.questionHistory["s1-001"].firstAttemptCorrect).toBe(true);
    // Some attempts were wrong, so no claim is made.
    expect(migrated.questionHistory["s2-003"].firstAttemptCorrect).toBe(false);
  });

  it("recomputes mock pass status from the raw score rather than trusting storage", () => {
    const migrated = migrateFromV1({
      ...V1_PAYLOAD,
      mockExamAttempts: [
        { ...V1_PAYLOAD.mockExamAttempts[0], score: 47, total: 68, percentage: 12 },
      ],
    });
    expect(migrated.mockExamAttempts[0].passed).toBe(true);
    expect(migrated.mockExamAttempts[0].percentage).toBe(69);
    expect(migrated.bestRawScore).toBe(47);
    expect(migrated.latestRawScore).toBe(47);
  });

  it("runs automatically on load and does not delete the v1 record", () => {
    const store = installStorage({
      [LEGACY_STORAGE_KEY_V1]: JSON.stringify(V1_PAYLOAD),
    });
    const loaded = loadProgress();
    expect(loaded.migratedFrom).toBe(1);
    expect(loaded.answeredQuestionIds).toHaveLength(3);
    expect(store.has(STORAGE_KEY)).toBe(true);
    expect(store.has(LEGACY_STORAGE_KEY_V1)).toBe(true);
  });

  it("does not erase progress when the v2 record is present", () => {
    const v2 = { ...createEmptyProgress(), answeredQuestionIds: ["s3-001"] };
    installStorage({ [STORAGE_KEY]: JSON.stringify(v2) });
    expect(loadProgress().answeredQuestionIds).toEqual(["s3-001"]);
  });
});

describe("corrupted storage handling", () => {
  it("returns empty progress for unparseable data rather than throwing", () => {
    installStorage({ [STORAGE_KEY]: "{not json" });
    expect(loadProgress().answeredQuestionIds).toEqual([]);
  });

  it("falls back to the v1 record when the v2 record is corrupt", () => {
    installStorage({
      [STORAGE_KEY]: "{{{",
      [LEGACY_STORAGE_KEY_V1]: JSON.stringify(V1_PAYLOAD),
    });
    expect(loadProgress().migratedFrom).toBe(1);
  });

  it("survives structurally wrong values inside a v2 record", () => {
    const normalized = normalizeProgress({
      version: 2,
      answeredQuestionIds: "nope",
      missedQuestionIds: [1, 2, "s1-001"],
      questionHistory: { "s1-001": "broken", "s1-002": { attempts: -5 } },
      mockExamAttempts: [{ score: "x", total: 0 }, null],
      lastSelectedDifficulty: "impossible",
    });
    expect(normalized.answeredQuestionIds).toEqual([]);
    expect(normalized.missedQuestionIds).toEqual(["s1-001"]);
    expect(normalized.questionHistory).toEqual({});
    expect(normalized.mockExamAttempts).toEqual([]);
    expect(normalized.lastSelectedDifficulty).toBe("all");
  });

  it("does not throw when storage itself is unavailable", () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new Error("blocked");
      },
    });
    expect(() => loadProgress()).not.toThrow();
    expect(() => clearProgress()).not.toThrow();
    expect(loadProgress().answeredQuestionIds).toEqual([]);
  });

  it("keeps working when writes are rejected", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error("quota exceeded");
        },
        removeItem: () => {},
      },
    });
    const saved = saveProgress({
      ...createEmptyProgress(),
      answeredQuestionIds: ["s1-001"],
    });
    expect(saved.answeredQuestionIds).toEqual(["s1-001"]);
  });
});

describe("analytics terminology", () => {
  const question = QUIZ_QUESTIONS[0] as QuizQuestion;

  it("separates unique questions attempted from total attempts", () => {
    installStorage();
    let progress = createEmptyProgress();
    const wrong = question.choices.find((c) => c.id !== question.correctChoiceId)!;
    progress = recordStudyAnswer(progress, question, wrong.id);
    progress = recordStudyAnswer(progress, question, wrong.id);
    progress = recordStudyAnswer(progress, question, question.correctChoiceId);

    const stats = buildProgressStats(progress, QUIZ_QUESTIONS);
    expect(stats.uniqueQuestionsAttempted).toBe(1);
    expect(stats.totalAttempts).toBe(3);
    // First attempt was wrong, so first-attempt accuracy stays at zero even
    // though repeated retries lifted the all-attempt figure.
    expect(stats.firstAttemptAccuracy).toBe(0);
    expect(stats.allAttemptAccuracy).toBe(33);
  });

  it("does not call a tag weak until a meaningful sample exists", () => {
    installStorage();
    let progress = createEmptyProgress();
    const wrong = question.choices.find((c) => c.id !== question.correctChoiceId)!;
    progress = recordStudyAnswer(progress, question, wrong.id);
    expect(buildProgressStats(progress, QUIZ_QUESTIONS).weakestTags).toEqual([]);

    for (let i = 0; i < MIN_SAMPLE_FOR_INSIGHT; i++) {
      progress = recordStudyAnswer(progress, question, wrong.id);
    }
    expect(
      buildProgressStats(progress, QUIZ_QUESTIONS).weakestTags.length,
    ).toBeGreaterThan(0);
  });

  it("distinguishes sections never attempted from sections answered badly", () => {
    installStorage();
    let progress = createEmptyProgress();
    progress = recordStudyAnswer(progress, question, question.correctChoiceId);
    const stats = buildProgressStats(progress, QUIZ_QUESTIONS);
    expect(stats.notAttemptedSections).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(stats.sectionAccuracy[1].total).toBe(1);
  });

  it("reports coverage against the whole bank", () => {
    installStorage();
    let progress = createEmptyProgress();
    for (const q of QUIZ_QUESTIONS.slice(0, 32)) {
      progress = recordStudyAnswer(progress, q, q.correctChoiceId);
    }
    const stats = buildProgressStats(progress, QUIZ_QUESTIONS);
    expect(stats.bankSize).toBe(QUIZ_QUESTIONS.length);
    expect(stats.uniqueQuestionsAttempted).toBe(32);
    expect(stats.coveragePercent).toBe(
      Math.round((32 / QUIZ_QUESTIONS.length) * 100),
    );
  });

  it("toggles a bookmark on and off", () => {
    installStorage();
    let progress = createEmptyProgress();
    progress = toggleBookmark(progress, "s1-001");
    expect(progress.bookmarkedQuestionIds).toEqual(["s1-001"]);
    progress = toggleBookmark(progress, "s1-001");
    expect(progress.bookmarkedQuestionIds).toEqual([]);
  });
});
