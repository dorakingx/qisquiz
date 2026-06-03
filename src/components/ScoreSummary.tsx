"use client";

import Link from "next/link";
import type { QuizAnswer, QuizQuestion, StudyConfig } from "@/types/quiz";
import { buildQuizUrl } from "@/lib/quiz";

type ScoreSummaryProps = {
  answers: QuizAnswer[];
  questions: QuizQuestion[];
  studyConfig: StudyConfig;
};

export function ScoreSummary({
  answers,
  questions,
  studyConfig,
}: ScoreSummaryProps) {
  const total = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  const incorrect = total - correct;
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

  const missedIds = new Set(
    answers.filter((a) => !a.isCorrect).map((a) => a.questionId),
  );
  const missedQuestions = questions.filter((q) => missedIds.has(q.id));

  const retryUrl = buildQuizUrl(
    studyConfig,
    missedQuestions.map((q) => q.id),
  );
  const restartUrl = buildQuizUrl(studyConfig);

  return (
    <div className="w-full max-w-3xl space-y-8">
      <div className="card text-center">
        <h2 className="text-xl font-semibold text-zinc-100">Quiz complete</h2>
        <p className="mt-2 text-sm text-zinc-400">
          IBM Certified Quantum Computation using Qiskit v2.X Developer (C1000-179)
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-zinc-800 pt-8">
          <div>
            <p className="font-mono text-3xl font-bold tabular-nums text-emerald-400">
              {correct}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Correct</p>
          </div>
          <div>
            <p className="font-mono text-3xl font-bold tabular-nums text-rose-400">
              {incorrect}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Incorrect</p>
          </div>
          <div>
            <p className="font-mono text-3xl font-bold tabular-nums text-cyan-400">
              {accuracy}%
            </p>
            <p className="mt-1 text-xs text-zinc-500">Accuracy</p>
          </div>
        </div>

        <p className="mt-6 font-mono text-lg text-zinc-300">
          Score: {correct} / {total}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {missedQuestions.length > 0 ? (
            <Link
              href={retryUrl}
              className="rounded-lg bg-amber-600 px-5 py-3 text-center text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-500"
            >
              Retry incorrect ({missedQuestions.length})
            </Link>
          ) : null}
          <Link
            href={restartUrl}
            className="rounded-lg bg-cyan-600 px-5 py-3 text-center text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-500"
          >
            Restart all questions
          </Link>
          <Link
            href="/topics"
            className="rounded-lg border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
          >
            Browse topics
          </Link>
        </div>
      </div>

      {missedQuestions.length > 0 ? (
        <section>
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">
            Review missed questions
          </h3>
          <ul className="space-y-4">
            {missedQuestions.map((q) => {
              const answer = answers.find((a) => a.questionId === q.id);
              return (
                <li key={q.id} className="card">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="badge-section">Section {q.section}</span>
                    <span className="text-xs text-zinc-500">{q.id}</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-200">
                    {q.question}
                  </p>
                  {answer !== undefined ? (
                    <p className="mt-3 text-sm text-rose-400/90">
                      Your answer: {q.choices[answer.selectedIndex] ?? "—"}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-emerald-400/90">
                    Correct answer: {q.choices[q.correctAnswerIndex]}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {q.explanation}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <div className="card text-center">
          <p className="text-emerald-400">Perfect score — no missed questions.</p>
        </div>
      )}
    </div>
  );
}
