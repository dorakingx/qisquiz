"use client";

import type { ChoiceId, PresentedQuestion } from "@/types/quiz";
import { AnswerChoiceList } from "./AnswerChoiceList";
import { CodeBlock } from "./CodeBlock";
import { QuestionMetadata } from "./QuestionMetadata";

type QuizCardProps = {
  presented: PresentedQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedChoiceId: ChoiceId | null;
  /** True once the learner has answered and feedback may be shown. */
  showFeedback: boolean;
  bookmarked?: boolean;
  onSelect: (choiceId: ChoiceId) => void;
  onToggleBookmark?: () => void;
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

export function QuizCard({
  presented,
  questionNumber,
  totalQuestions,
  selectedChoiceId,
  showFeedback,
  bookmarked = false,
  onSelect,
  onToggleBookmark,
}: QuizCardProps) {
  const { question, displayChoices } = presented;
  const isCorrect = showFeedback && selectedChoiceId === question.correctChoiceId;

  return (
    <article className="card">
      {/*
        Pre-answer header. Section and difficulty are orientation aids in study
        mode; tags, concept, objective, sources, and common mistakes are
        deliberately withheld until the learner has answered, because they can
        give the answer away.
      */}
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-section">
            Section {question.section}: {question.sectionTitle}
          </span>
          <span className={difficultyBadgeClass(question.difficulty)}>
            {question.difficulty}
          </span>
        </div>
        <span className="text-sm text-zinc-500">
          Question {questionNumber} / {totalQuestions}
        </span>
      </header>

      {onToggleBookmark ? (
        <button
          type="button"
          onClick={onToggleBookmark}
          className="mb-4 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
          aria-pressed={bookmarked}
        >
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </button>
      ) : null}

      <h2 className="text-lg font-medium leading-snug text-zinc-100 sm:text-xl">
        {question.question}
      </h2>

      {question.code ? (
        <div className="mt-5">
          <CodeBlock
            code={question.code}
            language={question.codeLanguage ?? "python"}
          />
        </div>
      ) : null}

      <div className="mt-8">
        <AnswerChoiceList
          choices={displayChoices}
          selectedChoiceId={selectedChoiceId}
          revealed={showFeedback}
          correctChoiceId={showFeedback ? question.correctChoiceId : undefined}
          onSelect={onSelect}
        />
      </div>

      {showFeedback && selectedChoiceId !== null ? (
        <div
          role="status"
          aria-live="polite"
          data-testid="answer-feedback"
          className={`mt-6 rounded-lg border px-4 py-3 ${
            isCorrect
              ? "border-emerald-500/40 bg-emerald-950/30"
              : "border-rose-500/40 bg-rose-950/30"
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              isCorrect ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isCorrect ? "Correct" : "Incorrect"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            {question.explanation}
          </p>
          {question.commonMistake ? (
            <p className="mt-3 text-sm leading-relaxed text-amber-200/90">
              Common mistake: {question.commonMistake}
            </p>
          ) : null}
          <QuestionMetadata
            question={question}
            className="mt-4 border-t border-zinc-800/80 pt-4"
          />
        </div>
      ) : null}
    </article>
  );
}
