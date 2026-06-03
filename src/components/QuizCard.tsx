"use client";

import type { QuizQuestion } from "@/types/quiz";
import { AnswerChoice } from "./AnswerChoice";
import { CodeBlock } from "./CodeBlock";

type QuizCardProps = {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedIndex: number | null;
  showFeedback: boolean;
  onSelect: (index: number) => void;
};

function detectCodeLanguage(code: string): "python" | "openqasm" {
  return code.trimStart().startsWith("OPENQASM") ? "openqasm" : "python";
}

function difficultyBadgeClass(difficulty: QuizQuestion["difficulty"]): string {
  switch (difficulty) {
    case "easy":
      return "badge-easy";
    case "medium":
      return "badge-medium";
    case "hard":
      return "badge-hard";
  }
}

export function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  selectedIndex,
  showFeedback,
  onSelect,
}: QuizCardProps) {
  return (
    <article className="card">
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

      {question.tags.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-zinc-800/80 px-2 py-0.5 font-mono text-xs text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <h2 className="text-lg font-medium leading-snug text-zinc-100 sm:text-xl">
        {question.question}
      </h2>

      {question.code ? (
        <div className="mt-5">
          <CodeBlock
            code={question.code}
            language={detectCodeLanguage(question.code)}
          />
        </div>
      ) : null}

      <div
        className="mt-8 flex flex-col gap-3"
        role="radiogroup"
        aria-label="Answer choices"
      >
        {question.choices.map((choice, index) => (
          <AnswerChoice
            key={index}
            index={index}
            label={choice}
            selected={selectedIndex === index}
            locked={showFeedback}
            isCorrect={index === question.correctAnswerIndex}
            onSelect={() => onSelect(index)}
          />
        ))}
      </div>

      {showFeedback && selectedIndex !== null ? (
        <div
          role="status"
          aria-live="polite"
          className={`mt-6 rounded-lg border px-4 py-3 ${
            selectedIndex === question.correctAnswerIndex
              ? "border-emerald-500/40 bg-emerald-950/30"
              : "border-rose-500/40 bg-rose-950/30"
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              selectedIndex === question.correctAnswerIndex
                ? "text-emerald-400"
                : "text-rose-400"
            }`}
          >
            {selectedIndex === question.correctAnswerIndex
              ? "Correct"
              : "Incorrect"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            {question.explanation}
          </p>
          {question.commonMistake ? (
            <p className="mt-3 text-sm leading-relaxed text-amber-200/90">
              Common mistake: {question.commonMistake}
            </p>
          ) : null}
          {question.sourceReference ? (
            <p className="mt-2 text-xs text-zinc-500">
              Reference: {question.sourceReference}
            </p>
          ) : null}
          {question.relatedDocsUrl ? (
            <a
              href={question.relatedDocsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs font-medium text-accent hover:underline"
            >
              Open related docs
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
