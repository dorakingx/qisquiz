"use client";

import Link from "next/link";
import type { ChoiceId, QuizQuestion } from "@/types/quiz";
import { getCorrectChoice } from "@/types/quiz";
import { buildQuizUrl } from "@/lib/quiz";
import { CodeBlock } from "./CodeBlock";
import { QuestionMetadata } from "./QuestionMetadata";

export type QuestionReviewProps = {
  question: QuizQuestion;
  /**
   * The choice the learner picked, `null` when unanswered, or
   * `"legacy-unknown"` for records migrated from a schema that stored a
   * display position rather than a stable choice id.
   */
  selectedChoiceId: ChoiceId | "legacy-unknown" | null;
  showRetryLink?: boolean;
};

function difficultyBadgeClass(difficulty: string): string {
  switch (difficulty) {
    case "easy":
      return "badge-easy";
    case "medium":
      return "badge-medium";
    default:
      return "badge-hard";
  }
}

/**
 * Full post-answer review of one question.
 *
 * Always renders the original code block for code-based questions: a review
 * that shows only the stem of a code question is incomplete.
 */
export function QuestionReview({
  question,
  selectedChoiceId,
  showRetryLink = true,
}: QuestionReviewProps) {
  const correctChoice = getCorrectChoice(question);
  const selectedChoice =
    selectedChoiceId && selectedChoiceId !== "legacy-unknown"
      ? question.choices.find((choice) => choice.id === selectedChoiceId)
      : undefined;

  const yourAnswerText =
    selectedChoiceId === null
      ? "Unanswered"
      : selectedChoiceId === "legacy-unknown"
        ? "Recorded before this app tracked stable answer ids"
        : (selectedChoice?.text ?? "Unavailable");

  const retryUrl = buildQuizUrl(
    {
      mode: "section",
      sections: "all",
      difficulty: "all",
      count: "all",
      order: "sequential",
    },
    [question.id],
  );

  return (
    <li className="card" data-testid="question-review" data-question-id={question.id}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="badge-section">Section {question.section}</span>
        <span className={difficultyBadgeClass(question.difficulty)}>
          {question.difficulty}
        </span>
        <span className="font-mono text-xs text-zinc-500">{question.id}</span>
      </div>

      <p className="text-sm font-medium text-zinc-100">{question.question}</p>

      {question.code ? (
        <div className="mt-4" data-testid="review-code">
          <CodeBlock
            code={question.code}
            language={question.codeLanguage ?? "python"}
          />
        </div>
      ) : null}

      <p className="mt-4 text-sm text-rose-300">Your answer: {yourAnswerText}</p>
      <p className="mt-2 text-sm text-emerald-300">
        Correct answer: {correctChoice.text}
      </p>

      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        {question.explanation}
      </p>
      {question.commonMistake ? (
        <p className="mt-3 text-sm leading-relaxed text-amber-300/90">
          Common mistake: {question.commonMistake}
        </p>
      ) : null}

      <QuestionMetadata
        question={question}
        className="mt-4 border-t border-zinc-800/80 pt-4"
      />

      {showRetryLink ? (
        <Link
          href={retryUrl}
          data-testid="retry-question"
          className="mt-4 inline-block rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
        >
          Retry this question
        </Link>
      ) : null}
    </li>
  );
}
