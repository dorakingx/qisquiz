import {
  EXAM_TOTAL_QUESTIONS,
  MOCK_EXAM_SECTION_TARGETS,
} from "@/config/exam";
import type {
  ChoiceId,
  PresentedQuestion,
  QuestionType,
  QuizAnswer,
  QuizQuestion,
  StudyConfig,
} from "@/types/quiz";
import { QUESTION_TYPES } from "@/types/quiz";
import { createRandom, shuffleForKey, shuffleRandom, shuffleWith } from "./shuffle";

export function filterQuestions(
  questions: QuizQuestion[],
  config: Pick<StudyConfig, "sections" | "difficulty" | "tag" | "questionType">,
): QuizQuestion[] {
  return questions.filter((q) => {
    if (config.sections !== "all" && !config.sections.includes(q.section)) {
      return false;
    }
    if (config.difficulty !== "all" && q.difficulty !== config.difficulty) {
      return false;
    }
    if (config.tag && !q.tags.includes(config.tag)) {
      return false;
    }
    if (config.questionType && q.questionType !== config.questionType) {
      return false;
    }
    return true;
  });
}

export function orderQuestions(
  questions: QuizQuestion[],
  order: StudyConfig["order"],
): QuizQuestion[] {
  if (order === "sequential") {
    return [...questions].sort((a, b) => {
      if (a.section !== b.section) return a.section - b.section;
      return a.id.localeCompare(b.id);
    });
  }
  return shuffleRandom(questions);
}

function limitQuestions(
  questions: QuizQuestion[],
  count: StudyConfig["count"],
): QuizQuestion[] {
  if (count === "all") return questions;
  return questions.slice(0, count);
}

/**
 * Build one mock-exam session: exactly EXAM_TOTAL_QUESTIONS unique questions,
 * distributed across sections according to the official blueprint weights.
 *
 * The source bank is never mutated.
 */
export function buildMockExamSession(
  questions: readonly QuizQuestion[],
  seed?: number,
): QuizQuestion[] {
  const random = seed === undefined ? Math.random : createRandom(seed);
  const selected: QuizQuestion[] = [];
  const selectedIds = new Set<string>();

  const sectionNumbers = Object.keys(MOCK_EXAM_SECTION_TARGETS)
    .map((value) => Number.parseInt(value, 10))
    .sort((a, b) => a - b);

  for (const section of sectionNumbers) {
    const target = MOCK_EXAM_SECTION_TARGETS[section];
    const pool = questions.filter((q) => q.section === section);
    for (const question of shuffleWith(pool, random).slice(0, target)) {
      selected.push(question);
      selectedIds.add(question.id);
    }
  }

  // If a section is short of its target, top up from the rest of the bank so a
  // sitting always has the official question count.
  if (selected.length < EXAM_TOTAL_QUESTIONS) {
    const remaining = questions.filter((q) => !selectedIds.has(q.id));
    for (const question of shuffleWith(remaining, random).slice(
      0,
      EXAM_TOTAL_QUESTIONS - selected.length,
    )) {
      selected.push(question);
      selectedIds.add(question.id);
    }
  }

  return shuffleWith(selected.slice(0, EXAM_TOTAL_QUESTIONS), random);
}

export function buildQuizSession(
  questions: QuizQuestion[],
  config: StudyConfig,
  retryIds?: string[],
): QuizQuestion[] {
  if (retryIds && retryIds.length > 0) {
    const retrySet = new Set(retryIds);
    const retryQuestions = questions.filter((q) => retrySet.has(q.id));
    return orderQuestions(retryQuestions, config.order);
  }

  if (config.mode === "mock") {
    return buildMockExamSession(questions);
  }

  const filtered = filterQuestions(questions, config);
  return limitQuestions(orderQuestions(filtered, config.order), config.count);
}

/**
 * Present a question with a shuffled display order.
 *
 * Correctness is carried by `correctChoiceId`, so shuffling the display order
 * can never change which answer is right. Passing a seed makes the order
 * reproducible for a saved exam attempt.
 */
export function presentQuestion(
  question: QuizQuestion,
  seed?: number,
): PresentedQuestion {
  const displayChoices =
    seed === undefined
      ? shuffleRandom(question.choices)
      : shuffleForKey(question.choices, seed, question.id);
  return { question, displayChoices };
}

export function presentQuestions(
  questions: QuizQuestion[],
  seed?: number,
): PresentedQuestion[] {
  return questions.map((question) => presentQuestion(question, seed));
}

/** Restore a saved display order from stored choice ids. */
export function presentWithOrder(
  question: QuizQuestion,
  order: ChoiceId[],
): PresentedQuestion {
  const byId = new Map(question.choices.map((choice) => [choice.id, choice]));
  const displayChoices = order
    .map((id) => byId.get(id))
    .filter((choice): choice is NonNullable<typeof choice> => Boolean(choice));

  // Guard against a stored order that no longer matches the question.
  if (displayChoices.length !== question.choices.length) {
    return { question, displayChoices: [...question.choices] };
  }
  return { question, displayChoices };
}

export function isCorrectChoice(
  question: QuizQuestion,
  choiceId: ChoiceId | null,
): boolean {
  return choiceId !== null && choiceId === question.correctChoiceId;
}

export function getMissedQuestions(
  answers: QuizAnswer[],
  questions: QuizQuestion[],
): QuizQuestion[] {
  const missedIds = new Set(
    answers.filter((a) => !a.isCorrect).map((a) => a.questionId),
  );
  return questions.filter((q) => missedIds.has(q.id));
}

export function parseStudyConfig(searchParams: URLSearchParams): StudyConfig {
  const mode = searchParams.get("mode") === "mock" ? "mock" : "section";

  const sectionsParam =
    searchParams.get("sections") ?? searchParams.get("section") ?? "all";
  const sections =
    sectionsParam === "all"
      ? "all"
      : sectionsParam
          .split(",")
          .map((value) => Number.parseInt(value, 10))
          .filter((value) => value >= 1 && value <= 8);

  const difficultyParam = searchParams.get("difficulty") ?? "all";
  const difficulty =
    difficultyParam === "easy" ||
    difficultyParam === "medium" ||
    difficultyParam === "hard"
      ? difficultyParam
      : "all";

  const orderParam = searchParams.get("order") ?? "sequential";
  const order = orderParam === "random" ? "random" : "sequential";
  const tag = searchParams.get("tag") ?? undefined;

  const typeParam = searchParams.get("type");
  const questionType =
    typeParam && QUESTION_TYPES.includes(typeParam as QuestionType)
      ? (typeParam as QuestionType)
      : undefined;

  const countParam =
    searchParams.get("count") ?? (mode === "mock" ? String(EXAM_TOTAL_QUESTIONS) : "all");
  let count: StudyConfig["count"] = "all";
  if (countParam === "10") count = 10;
  if (countParam === "20") count = 20;
  if (countParam === "40") count = 40;
  if (countParam === String(EXAM_TOTAL_QUESTIONS)) count = EXAM_TOTAL_QUESTIONS as 68;

  return {
    mode,
    sections: sections === "all" || sections.length > 0 ? sections : "all",
    difficulty,
    count,
    order,
    tag,
    questionType,
  };
}

export function parseRetryIds(searchParams: URLSearchParams): string[] {
  const retry = searchParams.get("retry");
  if (!retry) return [];
  return retry.split(",").filter(Boolean);
}

export function buildQuizUrl(config: StudyConfig, retryIds?: string[]): string {
  const params = new URLSearchParams();
  if (config.mode !== "section") {
    params.set("mode", config.mode);
  }
  if (config.sections !== "all") {
    params.set("sections", config.sections.join(","));
  }
  if (config.difficulty !== "all") {
    params.set("difficulty", config.difficulty);
  }
  if (config.count !== "all" && config.mode !== "mock") {
    params.set("count", String(config.count));
  }
  if (config.order !== "sequential") {
    params.set("order", config.order);
  }
  if (config.tag) {
    params.set("tag", config.tag);
  }
  if (config.questionType) {
    params.set("type", config.questionType);
  }
  if (retryIds && retryIds.length > 0) {
    params.set("retry", retryIds.join(","));
  }
  const query = params.toString();
  return query ? `/quiz?${query}` : "/quiz";
}

export function countQuestionsBySection(
  questions: QuizQuestion[],
): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const q of questions) {
    counts[q.section] = (counts[q.section] ?? 0) + 1;
  }
  return counts;
}
