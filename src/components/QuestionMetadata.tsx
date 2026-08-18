"use client";

import type { QuizQuestion } from "@/types/quiz";

/**
 * Learning metadata for one question.
 *
 * This component must only ever be rendered AFTER the learner has answered
 * (study mode) or after an exam has been submitted. Tags, concept, objective,
 * and documentation links routinely narrow the answer set, so showing them
 * beforehand is answer leakage.
 */
export function QuestionMetadata({
  question,
  className = "",
}: {
  question: QuizQuestion;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`} data-testid="question-metadata">
      {question.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5" data-testid="question-tags">
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

      <dl className="grid gap-x-6 gap-y-1 text-xs text-zinc-500 sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium text-zinc-400">Concept</dt>
          <dd>{question.concept}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium text-zinc-400">Objective</dt>
          <dd>{question.objective}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium text-zinc-400">Type</dt>
          <dd className="font-mono">{question.questionType}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium text-zinc-400">Reviewed</dt>
          <dd className="font-mono">
            {question.lastReviewedAt} · Qiskit {question.qiskitVersion}
          </dd>
        </div>
      </dl>

      {question.referenceUrls.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {question.referenceUrls.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-accent hover:underline"
            >
              {shortenDocUrl(url)}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function shortenDocUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments.slice(-2).join("/") || parsed.hostname;
  } catch {
    return url;
  }
}
