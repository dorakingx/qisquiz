"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { QUIZ_QUESTIONS } from "@/data/questions";
import {
  EXAM_PASSING_CORRECT_ANSWERS,
  EXAM_TOTAL_QUESTIONS,
} from "@/config/exam";
import {
  MIN_SAMPLE_FOR_INSIGHT,
  buildProgressStats,
  clearProgress,
  createEmptyProgress,
  loadProgress,
} from "@/lib/progress";
import type { AccuracyBucket } from "@/lib/progress";
import type { StudyProgress } from "@/types/quiz";
import { EXAM_SECTION_LIST } from "@/types/quiz";

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

/**
 * An accuracy row that distinguishes "not attempted" from "low accuracy", and
 * marks small samples so a single unlucky answer does not read as a weakness.
 */
function AccuracyBar({
  label,
  bucket,
}: {
  label: string;
  bucket: AccuracyBucket;
}) {
  const notAttempted = bucket.total === 0;
  const lowSample = !notAttempted && bucket.total < MIN_SAMPLE_FOR_INSIGHT;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="font-mono text-xs text-zinc-400">
          {notAttempted ? (
            <span className="text-zinc-600">not attempted</span>
          ) : (
            <>
              {bucket.accuracy}%{" "}
              <span className="text-zinc-500">
                ({bucket.correct}/{bucket.total}
                {lowSample ? ", small sample" : ""})
              </span>
            </>
          )}
        </span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800">
        {notAttempted ? null : (
          <div
            className={`h-2 rounded-full ${lowSample ? "bg-cyan-500/40" : "bg-cyan-500"}`}
            style={{ width: `${Math.min(100, Math.max(0, bucket.accuracy))}%` }}
          />
        )}
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

  const suggestedSection = EXAM_SECTION_LIST.find(
    (section) => section.number === stats.suggestedSection,
  );
  const recentAttempts = progress.mockExamAttempts.slice(0, 5);
  const latestAttempt = progress.mockExamAttempts[0] ?? null;
  const typeRows = Object.entries(stats.questionTypeAccuracy)
    .filter(([, bucket]) => bucket.total > 0)
    .sort((a, b) => a[1].accuracy - b[1].accuracy);

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
            Study progress stored in this browser only. No account or server is
            used.
            {progress.migratedFrom
              ? " Earlier progress was migrated from an older storage format."
              : ""}
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

      {stats.totalAttempts === 0 ? (
        <section className="card text-center">
          <h2 className="text-lg font-semibold text-zinc-100">No progress yet</h2>
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
            <StatCard
              label="Unique questions attempted"
              value={stats.uniqueQuestionsAttempted}
              detail={`${stats.coveragePercent}% of the ${stats.bankSize}-question bank`}
            />
            <StatCard
              label="Total attempts"
              value={stats.totalAttempts}
              detail="Includes repeats of the same question"
            />
            <StatCard
              label="First-attempt accuracy"
              value={`${stats.firstAttemptAccuracy}%`}
              detail="Counts only your first answer to each question"
            />
            <StatCard
              label="All-attempt accuracy"
              value={`${stats.allAttemptAccuracy}%`}
              detail="Rises with repeated retries, so read it alongside the first-attempt figure"
            />
          </div>

          {latestAttempt ? (
            <section className="card">
              <h2 className="text-lg font-semibold text-zinc-100">
                Latest mock exam
              </h2>
              <p className="mt-2 font-mono text-2xl text-zinc-100">
                {latestAttempt.score} / {latestAttempt.total}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                <span
                  className={
                    latestAttempt.passed
                      ? "font-semibold text-emerald-400"
                      : "font-semibold text-rose-400"
                  }
                >
                  {latestAttempt.passed
                    ? "At or above the pass mark"
                    : "Below the pass mark"}
                </span>{" "}
                · the official exam requires {EXAM_PASSING_CORRECT_ANSWERS} of{" "}
                {EXAM_TOTAL_QUESTIONS} correct answers · best so far{" "}
                {progress.bestRawScore}
              </p>
              <p className="mt-3 text-xs text-zinc-500">
                Unofficial estimate from an independent study tool, not
                affiliated with or endorsed by IBM.
              </p>
            </section>
          ) : null}

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
                {EXAM_SECTION_LIST.map((section) => (
                  <AccuracyBar
                    key={section.number}
                    label={`Section ${section.number}: ${section.title}`}
                    bucket={
                      stats.sectionAccuracy[section.number] ?? {
                        correct: 0,
                        total: 0,
                        accuracy: 0,
                      }
                    }
                  />
                ))}
              </div>
            </section>

            <section className="card">
              <h2 className="text-lg font-semibold text-zinc-100">
                Accuracy by difficulty and format
              </h2>
              <div className="mt-5 space-y-4">
                {(["easy", "medium", "hard"] as const).map((difficulty) => (
                  <AccuracyBar
                    key={difficulty}
                    label={difficulty}
                    bucket={stats.difficultyAccuracy[difficulty]}
                  />
                ))}
                <AccuracyBar
                  label="Code-based questions"
                  bucket={stats.codeAccuracy.code}
                />
                <AccuracyBar
                  label="Non-code questions"
                  bucket={stats.codeAccuracy.nonCode}
                />
              </div>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="card">
              <h2 className="text-lg font-semibold text-zinc-100">
                Weakest tags
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Shown only after at least {MIN_SAMPLE_FOR_INSIGHT} answers on a
                tag.
              </p>
              {stats.weakestTags.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">
                  Not enough data yet on any single tag.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {stats.weakestTags.map((item) => (
                    <div
                      key={item.tag}
                      className="flex items-center justify-between gap-3"
                    >
                      <Link
                        href={`/quiz?tag=${encodeURIComponent(item.tag)}&count=10&order=random`}
                        className="font-mono text-sm text-accent hover:underline"
                      >
                        {item.tag}
                      </Link>
                      <span className="font-mono text-xs text-zinc-100">
                        {item.accuracy}%{" "}
                        <span className="text-zinc-500">(n={item.total})</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="card">
              <h2 className="text-lg font-semibold text-zinc-100">
                Accuracy by question type
              </h2>
              {typeRows.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No data yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {typeRows.map(([type, bucket]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between gap-3"
                    >
                      <Link
                        href={`/quiz?type=${encodeURIComponent(type)}&count=10&order=random`}
                        className="font-mono text-sm text-accent hover:underline"
                      >
                        {type}
                      </Link>
                      <span className="font-mono text-xs text-zinc-100">
                        {bucket.accuracy}%{" "}
                        <span className="text-zinc-500">(n={bucket.total})</span>
                      </span>
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
                        {attempt.score}/{attempt.total}{" "}
                        <span
                          className={
                            attempt.passed ? "text-emerald-400" : "text-rose-400"
                          }
                        >
                          {attempt.passed ? "pass" : "below"}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {stats.notAttemptedSections.length > 0 ? (
            <section className="card">
              <h2 className="text-lg font-semibold text-zinc-100">
                Not yet attempted
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                These sections have no recorded answers, which is different from
                scoring poorly on them.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {stats.notAttemptedSections.map((section) => (
                  <Link
                    key={section}
                    href={`/quiz?sections=${section}&count=10&order=random`}
                    className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
                  >
                    Section {section}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {stats.mostMissedQuestions.length > 0 ? (
            <section className="card">
              <h2 className="text-lg font-semibold text-zinc-100">
                Most missed questions
              </h2>
              <div className="mt-4 space-y-4">
                {stats.mostMissedQuestions.slice(0, 5).map(({ question, misses }) => (
                  <div key={question.id}>
                    <p className="text-sm text-zinc-300">{question.question}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {misses} miss{misses === 1 ? "" : "es"} · Section{" "}
                      {question.section} ·{" "}
                      <Link
                        href={`/quiz?retry=${question.id}`}
                        className="text-accent hover:underline"
                      >
                        retry this question
                      </Link>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
