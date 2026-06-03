"use client";

import Link from "next/link";
import type { QuizAnswer, QuizQuestion, StudyConfig } from "@/types/quiz";
import { buildQuizUrl } from "@/lib/quiz";
import { EXAM_SECTIONS } from "@/types/quiz";

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
    { ...studyConfig, mode: "section", count: "all" },
    missedQuestions.map((q) => q.id),
  );
  const restartUrl = buildQuizUrl(studyConfig);
  const sectionStats = EXAM_SECTIONS.map((section) => {
    const sectionQuestions = questions.filter((q) => q.section === section.number);
    const sectionAnswers = answers.filter((answer) =>
      sectionQuestions.some((q) => q.id === answer.questionId),
    );
    const sectionCorrect = sectionAnswers.filter((answer) => answer.isCorrect).length;
    const sectionAccuracy =
      sectionAnswers.length === 0
        ? null
        : Math.round((sectionCorrect / sectionAnswers.length) * 100);
    return {
      ...section,
      attempted: sectionAnswers.length,
      correct: sectionCorrect,
      accuracy: sectionAccuracy,
    };
  }).filter((section) => section.attempted > 0);
  const weakSections = sectionStats
    .filter((section) => section.accuracy !== null && section.accuracy < 75)
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));

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

      {sectionStats.length > 1 ? (
        <section className="card">
          <h3 className="text-lg font-semibold text-zinc-100">
            Weak-area review
          </h3>
          <div className="mt-4 space-y-3">
            {sectionStats
              .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0))
              .map((section) => (
                <div
                  key={section.number}
                  className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      Section {section.number}: {section.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {section.correct} / {section.attempted} correct
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-sm ${
                        (section.accuracy ?? 0) < 75
                          ? "text-amber-300"
                          : "text-emerald-300"
                      }`}
                    >
                      {section.accuracy}%
                    </span>
                    <Link
                      href={buildQuizUrl({
                        mode: "section",
                        sections: [section.number],
                        difficulty: "all",
                        count: 10,
                        order: "random",
                      })}
                      className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
          </div>
          {weakSections.length === 0 ? (
            <p className="mt-4 text-sm text-emerald-400">
              No weak sections under 75% in this session.
            </p>
          ) : null}
        </section>
      ) : null}

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
                  {q.commonMistake ? (
                    <p className="mt-3 text-sm leading-relaxed text-amber-300/90">
                      Common mistake: {q.commonMistake}
                    </p>
                  ) : null}
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
