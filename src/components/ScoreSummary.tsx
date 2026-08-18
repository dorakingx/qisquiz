"use client";

import Link from "next/link";
import { useState } from "react";
import type { QuestionType, QuizAnswer, QuizQuestion, StudyConfig } from "@/types/quiz";
import { EXAM_SECTION_LIST } from "@/types/quiz";
import { buildQuizUrl } from "@/lib/quiz";
import { clearProgress } from "@/lib/progress";
import { QuestionReview } from "./QuestionReview";

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

  const answerById = new Map(answers.map((answer) => [answer.questionId, answer]));
  const missedIds = new Set(
    answers.filter((a) => !a.isCorrect).map((a) => a.questionId),
  );
  const missedQuestions = questions.filter((q) => missedIds.has(q.id));

  const retryUrl = buildQuizUrl(
    { ...studyConfig, mode: "section", count: "all" },
    missedQuestions.map((q) => q.id),
  );
  const restartUrl = buildQuizUrl(studyConfig);
  const [progressCleared, setProgressCleared] = useState(false);

  const sectionStats = EXAM_SECTION_LIST.map((section) => {
    const sectionQuestions = questions.filter((q) => q.section === section.number);
    const sectionIds = new Set(sectionQuestions.map((q) => q.id));
    const sectionAnswers = answers.filter((answer) => sectionIds.has(answer.questionId));
    const sectionCorrect = sectionAnswers.filter((a) => a.isCorrect).length;
    return {
      ...section,
      attempted: sectionAnswers.length,
      correct: sectionCorrect,
      accuracy:
        sectionAnswers.length === 0
          ? null
          : Math.round((sectionCorrect / sectionAnswers.length) * 100),
    };
  }).filter((section) => section.attempted > 0);

  const missedTags = Array.from(
    new Set(missedQuestions.flatMap((question) => question.tags)),
  ).slice(0, 10);
  const missedDifficulties = Array.from(
    new Set(missedQuestions.map((question) => question.difficulty)),
  );
  const missedTypes = Array.from(
    new Set(missedQuestions.map((question) => question.questionType)),
  ) as QuestionType[];

  function handleClearProgress() {
    clearProgress();
    setProgressCleared(true);
  }

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
          <button
            type="button"
            onClick={handleClearProgress}
            className="rounded-lg border border-rose-900/70 px-5 py-3 text-center text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-950/30"
          >
            Clear progress
          </button>
        </div>
        {progressCleared ? (
          <p className="mt-4 text-sm text-rose-200">
            Local progress has been cleared.
          </p>
        ) : null}
      </div>

      {missedQuestions.length > 0 ? (
        <section className="card">
          <h3 className="text-lg font-semibold text-zinc-100">Targeted retry</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Practise the areas this session flagged.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {missedDifficulties.map((difficulty) => (
              <Link
                key={difficulty}
                href={buildQuizUrl({
                  mode: "section",
                  sections: "all",
                  difficulty,
                  count: 10,
                  order: "random",
                })}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold capitalize text-zinc-200 transition-colors hover:bg-zinc-800"
              >
                Retry {difficulty}
              </Link>
            ))}
            {missedTypes.map((questionType) => (
              <Link
                key={questionType}
                href={buildQuizUrl({
                  mode: "section",
                  sections: "all",
                  difficulty: "all",
                  count: 10,
                  order: "random",
                  questionType,
                })}
                className="rounded-lg border border-zinc-700 px-3 py-2 font-mono text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
              >
                {questionType}
              </Link>
            ))}
            {missedTags.map((tag) => (
              <Link
                key={tag}
                href={buildQuizUrl({
                  mode: "section",
                  sections: "all",
                  difficulty: "all",
                  count: 10,
                  order: "random",
                  tag,
                })}
                className="rounded-lg border border-zinc-700 px-3 py-2 font-mono text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {sectionStats.length > 1 ? (
        <section className="card">
          <h3 className="text-lg font-semibold text-zinc-100">Section breakdown</h3>
          <div className="mt-4 space-y-3">
            {sectionStats
              .slice()
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
                      {section.correct} / {section.attempted} correct in this session
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
          <p className="mt-4 text-xs text-zinc-500">
            Session percentages come from a small sample. The dashboard tracks
            accuracy across all your sessions.
          </p>
        </section>
      ) : null}

      {missedQuestions.length > 0 ? (
        <section>
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">
            Review missed questions
          </h3>
          <ul className="space-y-4">
            {missedQuestions.map((question) => (
              <QuestionReview
                key={question.id}
                question={question}
                selectedChoiceId={
                  answerById.get(question.id)?.selectedChoiceId ?? null
                }
              />
            ))}
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
