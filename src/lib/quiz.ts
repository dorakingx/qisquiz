import type { QuizAnswer, QuizQuestion, StudyConfig } from "@/types/quiz";

const MOCK_EXAM_SECTION_TARGETS: Record<number, number> = {
  1: 11,
  2: 8,
  3: 12,
  4: 10,
  5: 8,
  6: 8,
  7: 7,
  8: 4,
};

export function filterQuestions(
  questions: QuizQuestion[],
  config: Pick<StudyConfig, "sections" | "difficulty" | "tag">,
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

  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function limitQuestions(
  questions: QuizQuestion[],
  count: StudyConfig["count"],
): QuizQuestion[] {
  if (count === "all") return questions;
  return questions.slice(0, count);
}

function sampleQuestions(
  questions: QuizQuestion[],
  count: number,
): QuizQuestion[] {
  return orderQuestions(questions, "random").slice(0, count);
}

function buildMockExamSession(questions: QuizQuestion[]): QuizQuestion[] {
  const selected: QuizQuestion[] = [];
  const selectedIds = new Set<string>();

  for (const [sectionValue, target] of Object.entries(
    MOCK_EXAM_SECTION_TARGETS,
  )) {
    const section = Number.parseInt(sectionValue, 10);
    const sectionQuestions = questions.filter((q) => q.section === section);
    for (const question of sampleQuestions(sectionQuestions, target)) {
      selected.push(question);
      selectedIds.add(question.id);
    }
  }

  if (selected.length < 68) {
    const remaining = questions.filter((q) => !selectedIds.has(q.id));
    selected.push(...sampleQuestions(remaining, 68 - selected.length));
  }

  return orderQuestions(selected.slice(0, 68), "random");
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

  const countParam = searchParams.get("count") ?? (mode === "mock" ? "68" : "all");
  let count: StudyConfig["count"] = "all";
  if (countParam === "10") count = 10;
  if (countParam === "20") count = 20;
  if (countParam === "40") count = 40;
  if (countParam === "68") count = 68;

  return {
    mode,
    sections: sections === "all" || sections.length > 0 ? sections : "all",
    difficulty,
    count,
    order,
    tag,
  };
}

export function parseRetryIds(searchParams: URLSearchParams): string[] {
  const retry = searchParams.get("retry");
  if (!retry) return [];
  return retry.split(",").filter(Boolean);
}

export function buildQuizUrl(
  config: StudyConfig,
  retryIds?: string[],
): string {
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
