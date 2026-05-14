"use client";

import type { QuizQuestion } from "@/data/questions";
import { TOPIC_LABEL } from "@/data/questions";
import { CodeBlock } from "./CodeBlock";

type QuestionViewProps = {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedChoiceId: string | null;
  showFeedback: boolean;
  correctChoiceId: string;
  onSelectChoice: (choiceId: string) => void;
};

export function QuestionView({
  question,
  questionNumber,
  totalQuestions,
  selectedChoiceId,
  showFeedback,
  correctChoiceId,
  onSelectChoice,
}: QuestionViewProps) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-xl shadow-black/20 sm:p-8">
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex w-fit rounded-md bg-cyan-950/80 px-2.5 py-1 text-xs font-medium text-cyan-300 ring-1 ring-cyan-500/30">
          {TOPIC_LABEL[question.topic]}
        </span>
        <span className="text-sm text-zinc-500">
          Question {questionNumber} of {totalQuestions}
        </span>
      </header>

      <h2 className="text-lg font-medium leading-snug text-zinc-100 sm:text-xl">
        {question.prompt}
      </h2>

      {question.code ? (
        <div className="mt-5">
          <CodeBlock code={question.code.text} language={question.code.language} />
        </div>
      ) : null}

      <div
        className="mt-8 flex flex-col gap-3"
        role="radiogroup"
        aria-label="Answer choices"
      >
        {question.choices.map((choice) => {
          const locked = showFeedback;
          const isSelected = selectedChoiceId === choice.id;
          const isCorrect = choice.id === correctChoiceId;
          let ring = "ring-zinc-700 hover:ring-zinc-500";
          if (locked && isSelected && isCorrect) {
            ring = "ring-emerald-500/80 bg-emerald-950/20";
          } else if (locked && isSelected && !isCorrect) {
            ring = "ring-rose-500/80 bg-rose-950/20";
          } else if (locked && !isSelected && isCorrect) {
            ring = "ring-emerald-600/50 bg-emerald-950/10";
          }

          return (
            <button
              key={choice.id}
              type="button"
              disabled={locked}
              aria-pressed={isSelected}
              onClick={() => onSelectChoice(choice.id)}
              className={`rounded-lg border border-zinc-800 px-4 py-3 text-left text-sm leading-relaxed text-zinc-200 ring-2 ring-transparent transition-colors disabled:cursor-default ${ring} ${
                !locked ? "hover:border-zinc-600 active:bg-zinc-800/80" : ""
              }`}
            >
              <span className="font-mono text-xs text-zinc-500">{choice.id}.</span>{" "}
              {choice.label}
            </button>
          );
        })}
      </div>
    </article>
  );
}
