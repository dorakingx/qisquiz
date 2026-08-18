import type { QuizQuestion } from "@/types/quiz";
import { SECTION_1_QUESTIONS } from "./section-1";
import { SECTION_2_QUESTIONS } from "./section-2";
import { SECTION_3_QUESTIONS } from "./section-3";
import { SECTION_4_QUESTIONS } from "./section-4";
import { SECTION_5_QUESTIONS } from "./section-5";
import { SECTION_6_QUESTIONS } from "./section-6";
import { SECTION_7_QUESTIONS } from "./section-7";
import { SECTION_8_QUESTIONS } from "./section-8";

/**
 * The complete authored question bank.
 *
 * Order here is presentational only. Every question carries an explicit,
 * permanent `id`, so adding, removing, or reordering entries never changes any
 * other question's identity, and stored progress stays valid.
 */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  ...SECTION_1_QUESTIONS,
  ...SECTION_2_QUESTIONS,
  ...SECTION_3_QUESTIONS,
  ...SECTION_4_QUESTIONS,
  ...SECTION_5_QUESTIONS,
  ...SECTION_6_QUESTIONS,
  ...SECTION_7_QUESTIONS,
  ...SECTION_8_QUESTIONS,
];

export const QUESTIONS_BY_ID: ReadonlyMap<string, QuizQuestion> = new Map(
  QUIZ_QUESTIONS.map((question) => [question.id, question]),
);

export function getQuestionById(id: string): QuizQuestion | undefined {
  return QUESTIONS_BY_ID.get(id);
}

export {
  SECTION_1_QUESTIONS,
  SECTION_2_QUESTIONS,
  SECTION_3_QUESTIONS,
  SECTION_4_QUESTIONS,
  SECTION_5_QUESTIONS,
  SECTION_6_QUESTIONS,
  SECTION_7_QUESTIONS,
  SECTION_8_QUESTIONS,
};
