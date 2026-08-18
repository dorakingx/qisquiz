import { EXAM_SECTIONS, getExamSectionTitle } from "@/config/exam";
import type { ExamSectionBlueprint } from "@/config/exam";

export type Difficulty = "easy" | "medium" | "hard";

/**
 * Question types tracked for diversity reporting.
 *
 * - `concept`            — recall or definition of a concept, no code.
 * - `code-output`        — predict the printed value or measured distribution.
 * - `code-behavior`      — reason about what a shown snippet does or changes.
 * - `code-completion`    — choose the token or expression that fills a blank.
 * - `debugging`          — find the defect or the correct fix for broken code.
 * - `workflow-selection` — choose the right API, mode, or workflow for a goal.
 * - `result-interpretation` — read a result object, metadata, or measurement data.
 * - `broadcasting-shape` — reason about PUB / array shapes and broadcasting.
 * - `documentation-navigation` — locate the authoritative source or setting.
 * - `multi-step-reasoning` — combine two or more related objectives.
 */
export type QuestionType =
  | "concept"
  | "code-output"
  | "code-behavior"
  | "code-completion"
  | "debugging"
  | "workflow-selection"
  | "result-interpretation"
  | "broadcasting-shape"
  | "documentation-navigation"
  | "multi-step-reasoning";

export const QUESTION_TYPES: QuestionType[] = [
  "concept",
  "code-output",
  "code-behavior",
  "code-completion",
  "debugging",
  "workflow-selection",
  "result-interpretation",
  "broadcasting-shape",
  "documentation-navigation",
  "multi-step-reasoning",
];

/** Question types that count as "direct recall" for diversity limits. */
export const RECALL_QUESTION_TYPES: QuestionType[] = ["concept"];

/**
 * Types that do NOT count as code-based even when a snippet is attached: a
 * definition or a "where is this documented" item is not made code-based by
 * decorating it with a listing.
 */
export const NON_CODE_QUESTION_TYPES: QuestionType[] = [
  "concept",
  "documentation-navigation",
];

/**
 * How the attached code snippet should be understood and verified.
 *
 * - `none`                — no code block.
 * - `executable`          — runs offline against Qiskit 2.x; output verified.
 * - `illustrative`        — syntactically valid but needs credentials/hardware.
 * - `intentional-error`   — deliberately broken; the defect is the subject.
 * - `partial-completion`  — contains a `_____` blank the learner must fill.
 */
export type CodeStatus =
  | "none"
  | "executable"
  | "illustrative"
  | "intentional-error"
  | "partial-completion";

export type CodeLanguage = "python" | "openqasm";

/** Stable per-question choice identifier. Never re-lettered once published. */
export type ChoiceId = "a" | "b" | "c" | "d";

export const CHOICE_IDS: ChoiceId[] = ["a", "b", "c", "d"];

export type QuizChoice = {
  /** Stable within the question; independent of display order. */
  id: ChoiceId;
  text: string;
};

/**
 * A narrowly scoped, documented exemption from one validator rule.
 * Every waiver must name the rule and give a concrete reason.
 */
export type QualityWaiver = {
  rule: string;
  reason: string;
};

export type QuizQuestion = {
  /** Explicit, stable, permanent identifier. Never derived from array index. */
  id: string;
  section: number;
  sectionTitle: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  question: string;
  code?: string;
  codeLanguage?: CodeLanguage;
  codeStatus: CodeStatus;
  /** Authored order. Display order is shuffled separately. */
  choices: QuizChoice[];
  /** The single correct choice, by stable id. */
  correctChoiceId: ChoiceId;
  explanation: string;
  commonMistake?: string;
  tags: string[];
  concept: string;
  objective: string;
  /** Exact official documentation URLs backing this question. */
  referenceUrls: string[];
  /** ISO date (YYYY-MM-DD) the item was last checked against those sources. */
  lastReviewedAt: string;
  qiskitVersion: string;
  estimatedTimeSeconds: number;
  qualityWaivers?: QualityWaiver[];
};

export function getCorrectChoice(question: QuizQuestion): QuizChoice {
  const choice = question.choices.find(
    (item) => item.id === question.correctChoiceId,
  );
  if (!choice) {
    throw new Error(
      `${question.id}: correctChoiceId "${question.correctChoiceId}" does not match any choice.`,
    );
  }
  return choice;
}

/**
 * A question is meaningfully code-based when it carries a snippet the learner
 * must actually read to answer, which excludes pure recall and documentation
 * navigation items.
 */
export function isCodeQuestion(question: QuizQuestion): boolean {
  return (
    Boolean(question.code) &&
    !NON_CODE_QUESTION_TYPES.includes(question.questionType)
  );
}

/** A question paired with the choice order actually shown to the learner. */
export type PresentedQuestion = {
  question: QuizQuestion;
  /** Choices in display order. Position determines the A/B/C/D label only. */
  displayChoices: QuizChoice[];
};

export type QuizAnswer = {
  questionId: string;
  /** Stable choice id the learner picked, or null when unanswered. */
  selectedChoiceId: ChoiceId | null;
  isCorrect: boolean;
};

export type StudyConfig = {
  mode: "section" | "mock";
  sections: number[] | "all";
  difficulty: Difficulty | "all";
  count: 10 | 20 | 40 | 68 | "all";
  order: "sequential" | "random";
  tag?: string;
  questionType?: QuestionType;
};

export type ExamSection = ExamSectionBlueprint;

export type QuestionPerformance = {
  questionId: string;
  attempts: number;
  correct: number;
  incorrect: number;
  /** True when the learner's very first attempt was correct. */
  firstAttemptCorrect: boolean;
  /**
   * Last selected choice id, or `"legacy-unknown"` for records migrated from
   * the v1 schema where the stored display index cannot be mapped safely.
   */
  lastSelectedChoiceId: ChoiceId | "legacy-unknown" | null;
  lastAnsweredAt: string;
};

export type MockExamAttempt = {
  id: string;
  completedAt: string;
  questionIds: string[];
  markedQuestionIds: string[];
  answers: QuizAnswer[];
  /** Raw number of correct answers. */
  score: number;
  total: number;
  /** Display-only. Never used to decide pass or fail. */
  percentage: number;
  passed: boolean;
  durationSeconds: number;
  submittedByTimeout: boolean;
};

/** Persisted state for an in-progress mock exam, so a refresh cannot reset it. */
export type MockExamSessionState = {
  version: 2;
  attemptId: string;
  questionIds: string[];
  /** Frozen display order per question, so a refresh cannot re-shuffle. */
  choiceOrder: Record<string, ChoiceId[]>;
  answers: Record<string, ChoiceId>;
  markedQuestionIds: string[];
  currentIndex: number;
  /** Epoch ms. The deadline is absolute, so refreshing cannot extend it. */
  startedAtMs: number;
  deadlineMs: number;
};

export type StudyProgress = {
  version: 2;
  answeredQuestionIds: string[];
  missedQuestionIds: string[];
  bookmarkedQuestionIds: string[];
  questionHistory: Record<string, QuestionPerformance>;
  lastSelectedSection: number | "all";
  lastSelectedDifficulty: Difficulty | "all";
  mockExamAttempts: MockExamAttempt[];
  /** Best raw mock-exam score, in correct answers. */
  bestRawScore: number;
  latestRawScore: number;
  updatedAt: string;
  /** Set when data was carried forward from an older schema version. */
  migratedFrom?: number;
};

export const EXAM_SECTION_LIST: ExamSection[] = EXAM_SECTIONS;

export { getExamSectionTitle };
