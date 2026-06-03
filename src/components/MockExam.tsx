"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QUIZ_QUESTIONS } from "@/data/questions";
import { buildQuizSession } from "@/lib/quiz";
import {
  buildMockAttempt,
  loadProgress,
  recordMockExamAttempt,
} from "@/lib/progress";
import type { Difficulty, MockExamAttempt, QuizQuestion, StudyConfig } from "@/types/quiz";
import { AnswerChoice } from "./AnswerChoice";
import { CodeBlock } from "./CodeBlock";

const MOCK_EXAM_SECONDS = 90 * 60;
const PASSING_ESTIMATE_PERCENT = 70;

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function detectCodeLanguage(code: string): "python" | "openqasm" {
  return code.trimStart().startsWith("OPENQASM") ? "openqasm" : "python";
}

function buildPerformanceRows(
  questions: QuizQuestion[],
  answers: MockExamAttempt["answers"],
  key: "section" | "difficulty",
) {
  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer]));
  const rows = new Map<string, { label: string; correct: number; total: number }>();

  for (const question of questions) {
    const answer = answerMap.get(question.id);
    const rowKey = String(question[key]);
    const label =
      key === "section"
        ? `Section ${question.section}: ${question.sectionTitle}`
        : question.difficulty;
    const row = rows.get(rowKey) ?? { label, correct: 0, total: 0 };
    row.total += 1;
    row.correct += answer?.isCorrect ? 1 : 0;
    rows.set(rowKey, row);
  }

  return Array.from(rows.values()).map((row) => ({
    ...row,
    accuracy: row.total === 0 ? 0 : Math.round((row.correct / row.total) * 100),
  }));
}

function difficultyBadgeClass(difficulty: Difficulty): string {
  switch (difficulty) {
    case "easy":
      return "badge-easy";
    case "medium":
      return "badge-medium";
    case "hard":
      return "badge-hard";
  }
}

export function MockExam() {
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedIds, setMarkedIds] = useState<string[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(MOCK_EXAM_SECONDS);
  const [attempt, setAttempt] = useState<MockExamAttempt | null>(null);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const markedSet = useMemo(() => new Set(markedIds), [markedIds]);

  const submitExam = useCallback(
    (submittedByTimeout: boolean) => {
      if (questions.length === 0 || submitted) return;
      const durationSeconds = MOCK_EXAM_SECONDS - remainingSeconds;
      const nextAttempt = buildMockAttempt(
        questions,
        answers,
        markedIds,
        durationSeconds,
        submittedByTimeout,
      );
      const progress = loadProgress();
      recordMockExamAttempt(progress, nextAttempt, questions);
      setAttempt(nextAttempt);
      setSubmitted(true);
    },
    [answers, markedIds, questions, remainingSeconds, submitted],
  );

  useEffect(() => {
    if (!started || submitted) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [started, submitted]);

  useEffect(() => {
    if (started && !submitted && remainingSeconds === 0) {
      submitExam(true);
    }
  }, [remainingSeconds, started, submitExam, submitted]);

  function startExam() {
    const config: StudyConfig = {
      mode: "mock",
      sections: "all",
      difficulty: "all",
      count: 68,
      order: "random",
    };
    setQuestions(buildQuizSession(QUIZ_QUESTIONS, config));
    setAnswers({});
    setMarkedIds([]);
    setCurrentIndex(0);
    setRemainingSeconds(MOCK_EXAM_SECONDS);
    setAttempt(null);
    setSubmitted(false);
    setStarted(true);
  }

  function selectAnswer(index: number) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: index }));
  }

  function toggleMark() {
    if (!currentQuestion) return;
    setMarkedIds((prev) =>
      prev.includes(currentQuestion.id)
        ? prev.filter((id) => id !== currentQuestion.id)
        : [...prev, currentQuestion.id],
    );
  }

  if (!started) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Exam simulation
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Mock Exam
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            68 randomized questions, 90 minutes, balanced across all C1000-179
            sections. Feedback and explanations unlock after submission.
          </p>
        </header>

        <section className="card">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="font-mono text-3xl font-semibold text-zinc-100">68</p>
              <p className="mt-1 text-xs text-zinc-500">Questions</p>
            </div>
            <div>
              <p className="font-mono text-3xl font-semibold text-zinc-100">90</p>
              <p className="mt-1 text-xs text-zinc-500">Minutes</p>
            </div>
            <div>
              <p className="font-mono text-3xl font-semibold text-zinc-100">8</p>
              <p className="mt-1 text-xs text-zinc-500">Exam sections</p>
            </div>
          </div>
          <button
            type="button"
            onClick={startExam}
            className="mt-8 rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-500"
          >
            Start mock exam
          </button>
        </section>
      </div>
    );
  }

  if (submitted && attempt) {
    const answerMap = new Map(attempt.answers.map((answer) => [answer.questionId, answer]));
    const incorrectQuestions = questions.filter(
      (question) => answerMap.get(question.id)?.isCorrect === false || !answerMap.has(question.id),
    );
    const markedQuestions = questions.filter((question) =>
      attempt.markedQuestionIds.includes(question.id),
    );
    const sectionRows = buildPerformanceRows(questions, attempt.answers, "section");
    const difficultyRows = buildPerformanceRows(questions, attempt.answers, "difficulty");

    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Mock exam results
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Score: {attempt.score} / {attempt.total}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {attempt.percentage}% ·{" "}
            {attempt.percentage >= PASSING_ESTIMATE_PERCENT
              ? "Pass estimate"
              : "Below pass estimate"}{" "}
            · Completed in {formatTime(attempt.durationSeconds)}
            {attempt.submittedByTimeout ? " · Auto-submitted" : ""}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="card">
            <h2 className="text-lg font-semibold text-zinc-100">
              Section performance
            </h2>
            <div className="mt-4 space-y-3">
              {sectionRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-300">{row.label}</span>
                  <span className="font-mono text-sm text-zinc-100">
                    {row.correct}/{row.total} · {row.accuracy}%
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold text-zinc-100">
              Difficulty performance
            </h2>
            <div className="mt-4 space-y-3">
              {difficultyRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <span className="capitalize text-sm text-zinc-300">{row.label}</span>
                  <span className="font-mono text-sm text-zinc-100">
                    {row.correct}/{row.total} · {row.accuracy}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-100">
              Incorrect or unanswered questions
            </h2>
            {incorrectQuestions.length === 0 ? (
              <div className="card text-sm text-emerald-300">No incorrect questions.</div>
            ) : (
              <ul className="space-y-4">
                {incorrectQuestions.map((question) => {
                  const answer = answerMap.get(question.id);
                  return (
                    <li key={question.id} className="card">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="badge-section">Section {question.section}</span>
                        <span className={difficultyBadgeClass(question.difficulty)}>
                          {question.difficulty}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-zinc-100">
                        {question.question}
                      </p>
                      <p className="mt-3 text-sm text-rose-300">
                        Your answer:{" "}
                        {answer
                          ? question.choices[answer.selectedIndex]
                          : "Unanswered"}
                      </p>
                      <p className="mt-2 text-sm text-emerald-300">
                        Correct answer: {question.choices[question.correctAnswerIndex]}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                        {question.explanation}
                      </p>
                      {question.relatedDocsUrl ? (
                        <a
                          href={question.relatedDocsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
                        >
                          Open related docs
                        </a>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-100">
              Marked questions
            </h2>
            {markedQuestions.length === 0 ? (
              <div className="card text-sm text-zinc-400">
                No questions were marked for review.
              </div>
            ) : (
              <ul className="space-y-4">
                {markedQuestions.map((question) => (
                  <li key={question.id} className="card">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="badge-section">Section {question.section}</span>
                      <span className={difficultyBadgeClass(question.difficulty)}>
                        {question.difficulty}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-100">
                      {question.question}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                      {question.explanation}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={startExam}
            className="rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-500"
          >
            Start another mock exam
          </button>
          <a
            href="/dashboard"
            className="rounded-lg border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
          >
            View dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Mock exam
          </p>
          <h1 className="mt-1 text-xl font-semibold text-foreground">
            Question {currentIndex + 1} of {questions.length}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {answeredCount} answered · {markedIds.length} marked
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <p
            className={`font-mono text-2xl font-semibold ${
              remainingSeconds < 600 ? "text-rose-300" : "text-zinc-100"
            }`}
          >
            {formatTime(remainingSeconds)}
          </p>
          <button
            type="button"
            onClick={() => submitExam(false)}
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-white"
          >
            Submit exam
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="card h-fit">
          <h2 className="text-sm font-semibold text-zinc-100">Progress</h2>
          <div className="mt-4 grid grid-cols-5 gap-2 lg:grid-cols-4">
            {questions.map((question, index) => {
              const answered = answers[question.id] !== undefined;
              const marked = markedSet.has(question.id);
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`h-9 rounded-lg border text-xs font-semibold transition-colors ${
                    index === currentIndex
                      ? "border-cyan-500 bg-cyan-950/40 text-cyan-200"
                      : answered
                        ? "border-emerald-800 bg-emerald-950/20 text-emerald-200"
                        : "border-zinc-800 bg-zinc-950/40 text-zinc-400"
                  } ${marked ? "ring-1 ring-amber-400/70" : ""}`}
                  aria-label={`Go to question ${index + 1}${marked ? ", marked" : ""}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </aside>

        {currentQuestion ? (
          <article className="card">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="badge-section">
                Section {currentQuestion.section}: {currentQuestion.sectionTitle}
              </span>
              <span className={difficultyBadgeClass(currentQuestion.difficulty)}>
                {currentQuestion.difficulty}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleMark}
              className="mb-5 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
              aria-pressed={markedSet.has(currentQuestion.id)}
            >
              {markedSet.has(currentQuestion.id) ? "Marked for review" : "Mark for review"}
            </button>

            <h2 className="text-lg font-medium leading-snug text-zinc-100 sm:text-xl">
              {currentQuestion.question}
            </h2>

            {currentQuestion.code ? (
              <div className="mt-5">
                <CodeBlock
                  code={currentQuestion.code}
                  language={detectCodeLanguage(currentQuestion.code)}
                />
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3" role="radiogroup">
              {currentQuestion.choices.map((choice, index) => (
                <AnswerChoice
                  key={choice}
                  index={index}
                  label={choice}
                  selected={answers[currentQuestion.id] === index}
                  locked={false}
                  isCorrect={false}
                  onSelect={() => selectAnswer(index)}
                />
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                disabled={currentIndex === 0}
                className="rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))
                }
                disabled={currentIndex === questions.length - 1}
                className="rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}
