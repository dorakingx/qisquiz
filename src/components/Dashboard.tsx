"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { QUIZ_QUESTIONS } from "@/data/questions";
import {
  buildProgressStats,
  clearProgress,
  createEmptyProgress,
  loadProgress,
} from "@/lib/progress";
import type { StudyProgress } from "@/types/quiz";
import { EXAM_SECTIONS } from "@/types/quiz";

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
      <p className="font-mono text-2xl font-semibold text-zinc-100">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
      {detail ? <p className="mt-2 text-xs text-zinc-400">{detail}</p> : null}
    </div>
  );
}

function AccuracyBar({
  label,
  accuracy,
  total,
}: {
  label: string;
  accuracy: number;
  total: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="font-mono text-zinc-100">
          {accuracy}% · {total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800">
        <div
          className="h-2 rounded-full bg-cyan-500"
          style={{ width: `${Math.min(100, Math.max(0, accuracy))}%` }}
        />
      </div>
    </div>
  );
}

export function Dashboard() {
  const [progress, setProgress] = useState<StudyProgress>(createEmptyProgress);
  const stats = useMemo(
    () => buildProgressStats(progress, QUIZ_QUESTIONS),
    [progress],
  );

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  function handleClearProgress() {
    setProgress(clearProgress());
  }

  const suggestedSection = EXAM_SECTIONS.find(
    (section) => section.number === stats.suggestedSection,
  );
  const recentAttempts = progress.mockExamAttempts.slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Progress analytics
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            Local study progress from this browser. No account or database is
            used yet.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClearProgress}
          className="rounded-lg border border-rose-900/70 px-4 py-2 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-950/30"
        >
          Clear progress
        </button>
      </header>

      {stats.totalAnswered === 0 ? (
        <section className="card text-center">
          <h2 className="text-lg font-semibold text-zinc-100">
            No progress yet
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Answer study questions or complete a mock exam to unlock analytics.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/topics"
              className="rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-500"
            >
              Start study mode
            </Link>
            <Link
              href="/mock-exam"
              className="rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              Start mock exam
            </Link>
          </div>
        </section>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Answers recorded" value={stats.totalAnswered} />
            <StatCard label="Overall accuracy" value={`${stats.overallAccuracy}%`} />
            <StatCard label="Best mock score" value={`${progress.bestScore}%`} />
            <StatCard label="Latest mock score" value={`${progress.latestScore}%`} />
          </div>

          {suggestedSection ? (
            <section className="card">
              <h2 className="text-lg font-semibold text-zinc-100">
                Suggested next section
              </h2>
              <p className="mt-2 text-sm text-zinc-300">
                Section {suggestedSection.number}: {suggestedSection.title}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {suggestedSection.description}
              </p>
              <Link
                href={`/quiz?sections=${suggestedSection.number}&count=10&order=random`}
                className="mt-5 inline-block rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-500"
              >
                Practice this section
              </Link>
            </section>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="card">
              <h2 className="text-lg font-semibold text-zinc-100">
                Accuracy by section
              </h2>
              <div className="mt-5 space-y-4">
                {EXAM_SECTIONS.map((section) => {
                  const value = stats.sectionAccuracy[section.number] ?? {
                    accuracy: 0,
                    total: 0,
                  };
                  return (
                    <AccuracyBar
                      key={section.number}
                      label={`Section ${section.number}`}
                      accuracy={value.accuracy}
                      total={value.total}
                    />
                  );
                })}
              </div>
            </section>

            <section className="card">
              <h2 className="text-lg font-semibold text-zinc-100">
                Accuracy by difficulty
              </h2>
              <div className="mt-5 space-y-4">
                {(["easy", "medium", "hard"] as const).map((difficulty) => (
                  <AccuracyBar
                    key={difficulty}
                    label={difficulty}
                    accuracy={stats.difficultyAccuracy[difficulty].accuracy}
                    total={stats.difficultyAccuracy[difficulty].total}
                  />
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="card">
              <h2 className="text-lg font-semibold text-zinc-100">
                Weakest tags
              </h2>
              {stats.weakestTags.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No tag data yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {stats.weakestTags.map((item) => (
                    <div key={item.tag} className="flex items-center justify-between gap-3">
                      <Link
                        href={`/quiz?tag=${encodeURIComponent(item.tag)}&count=10&order=random`}
                        className="text-sm text-accent hover:underline"
                      >
                        {item.tag}
                      </Link>
                      <span className="font-mono text-sm text-zinc-100">
                        {item.accuracy}% · {item.total}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="card">
              <h2 className="text-lg font-semibold text-zinc-100">
                Most missed
              </h2>
              {stats.mostMissedQuestions.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No missed questions.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {stats.mostMissedQuestions.slice(0, 5).map(({ question, misses }) => (
                    <div key={question.id}>
                      <p className="text-sm text-zinc-300">{question.question}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {misses} miss{misses === 1 ? "" : "es"} · Section{" "}
                        {question.section}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="card">
              <h2 className="text-lg font-semibold text-zinc-100">
                Recent mock scores
              </h2>
              {recentAttempts.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No mock exams yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {recentAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-sm text-zinc-300">
                        {new Date(attempt.completedAt).toLocaleDateString()}
                      </span>
                      <span className="font-mono text-sm text-zinc-100">
                        {attempt.score}/{attempt.total} · {attempt.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
