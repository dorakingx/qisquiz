import type { QuizAnswer, QuizQuestion, StudyConfig } from "@/types/quiz";

export function filterQuestions(
  questions: QuizQuestion[],
  config: Pick<StudyConfig, "section" | "difficulty">,
): QuizQuestion[] {
  return questions.filter((q) => {
    if (config.section !== "all" && q.section !== config.section) {
      return false;
    }
    if (config.difficulty !== "all" && q.difficulty !== config.difficulty) {
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

  const filtered = filterQuestions(questions, config);
  return orderQuestions(filtered, config.order);
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
  const sectionParam = searchParams.get("section") ?? "all";
  const section =
    sectionParam === "all" ? "all" : Number.parseInt(sectionParam, 10);

  const difficultyParam = searchParams.get("difficulty") ?? "all";
  const difficulty =
    difficultyParam === "easy" ||
    difficultyParam === "medium" ||
    difficultyParam === "hard"
      ? difficultyParam
      : "all";

  const orderParam = searchParams.get("order") ?? "sequential";
  const order = orderParam === "random" ? "random" : "sequential";

  return {
    section:
      section === "all" || (section >= 1 && section <= 8) ? section : "all",
    difficulty,
    order,
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
  if (config.section !== "all") {
    params.set("section", String(config.section));
  }
  if (config.difficulty !== "all") {
    params.set("difficulty", config.difficulty);
  }
  if (config.order !== "sequential") {
    params.set("order", config.order);
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
