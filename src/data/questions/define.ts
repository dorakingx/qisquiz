import { getExamSectionTitle } from "@/config/exam";
import type {
  ChoiceId,
  CodeLanguage,
  CodeStatus,
  Difficulty,
  QualityWaiver,
  QuestionType,
  QuizChoice,
  QuizQuestion,
} from "@/types/quiz";
import { CHOICE_IDS } from "@/types/quiz";

/**
 * Authoring shape for one question.
 *
 * `choices` is keyed by the stable choice id, and `answer` names the correct
 * key. Neither the object key order nor the array position of the question
 * carries any meaning: reordering the file cannot change which answer is
 * correct, and adding questions cannot change any existing id.
 */
export type QuestionSeed = {
  /** Explicit, permanent id. Must be unique across the whole bank. */
  id: string;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  code?: string;
  codeStatus?: CodeStatus;
  language?: CodeLanguage;
  choices: Record<ChoiceId, string>;
  answer: ChoiceId;
  explanation: string;
  mistake?: string;
  tags: string[];
  concept: string;
  objective: string;
  refs: string[];
  seconds?: number;
  /** Overrides the section-level review date when an item was checked later. */
  reviewedOn?: string;
  waivers?: QualityWaiver[];
};

export type SectionMeta = {
  section: number;
  /** Date every seed in the file was last checked against its references. */
  reviewedOn: string;
  qiskitVersion: string;
};

function defaultSeconds(difficulty: Difficulty): number {
  switch (difficulty) {
    case "easy":
      return 45;
    case "medium":
      return 70;
    case "hard":
      return 95;
  }
}

function detectLanguage(code: string): CodeLanguage {
  return code.trimStart().startsWith("OPENQASM") ? "openqasm" : "python";
}

export function defineSection(
  meta: SectionMeta,
  seeds: QuestionSeed[],
): QuizQuestion[] {
  const sectionTitle = getExamSectionTitle(meta.section);

  return seeds.map((seed) => {
    const choices: QuizChoice[] = CHOICE_IDS.map((id) => ({
      id,
      text: seed.choices[id],
    }));

    const codeStatus: CodeStatus =
      seed.codeStatus ?? (seed.code ? "illustrative" : "none");

    const question: QuizQuestion = {
      id: seed.id,
      section: meta.section,
      sectionTitle,
      difficulty: seed.difficulty,
      questionType: seed.type,
      question: seed.question,
      code: seed.code,
      codeLanguage: seed.code
        ? (seed.language ?? detectLanguage(seed.code))
        : undefined,
      codeStatus,
      choices,
      correctChoiceId: seed.answer,
      explanation: seed.explanation,
      commonMistake: seed.mistake,
      tags: seed.tags,
      concept: seed.concept,
      objective: seed.objective,
      referenceUrls: seed.refs,
      lastReviewedAt: seed.reviewedOn ?? meta.reviewedOn,
      qiskitVersion: meta.qiskitVersion,
      estimatedTimeSeconds: seed.seconds ?? defaultSeconds(seed.difficulty),
      qualityWaivers: seed.waivers,
    };

    return question;
  });
}
