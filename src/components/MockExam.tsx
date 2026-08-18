"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QUIZ_QUESTIONS } from "@/data/questions";
import {
  EXAM_CODE,
  EXAM_PASSING_CORRECT_ANSWERS,
  EXAM_TIME_LIMIT_MINUTES,
  EXAM_TOTAL_QUESTIONS,
} from "@/config/exam";
import { presentWithOrder } from "@/lib/quiz";
import {
  clearMockSession,
  createMockSession,
  elapsedSeconds,
  loadMockSession,
  remainingSeconds,
  resolveSessionQuestions,
  saveMockSession,
} from "@/lib/mock-exam-session";
import {
  buildMockAttempt,
  loadProgress,
  recordMockExamAttempt,
} from "@/lib/progress";
import type {
  ChoiceId,
  MockExamAttempt,
  MockExamSessionState,
  QuizQuestion,
} from "@/types/quiz";
import { AnswerChoiceList } from "./AnswerChoiceList";
import { CodeBlock } from "./CodeBlock";
import { QuestionReview } from "./QuestionReview";

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function buildPerformanceRows(
  questions: QuizQuestion[],
  attempt: MockExamAttempt,
  key: "section" | "difficulty",
) {
  const answerMap = new Map(
    attempt.answers.map((answer) => [answer.questionId, answer]),
  );
  const rows = new Map<string, { label: string; correct: number; total: number }>();

  for (const question of questions) {
    const rowKey = String(question[key]);
    const label =
      key === "section"
        ? `Section ${question.section}: ${question.sectionTitle}`
        : question.difficulty;
    const row = rows.get(rowKey) ?? { label, correct: 0, total: 0 };
    row.total += 1;
    row.correct += answerMap.get(question.id)?.isCorrect ? 1 : 0;
    rows.set(rowKey, row);
  }

  return Array.from(rows.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, row]) => ({
      ...row,
      accuracy: row.total === 0 ? 0 : Math.round((row.correct / row.total) * 100),
    }));
}

type Phase = "idle" | "running" | "submitted";

export function MockExam() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [session, setSession] = useState<MockExamSessionState | null>(null);
  const [resumable, setResumable] = useState<MockExamSessionState | null>(null);
  const [attempt, setAttempt] = useState<MockExamAttempt | null>(null);
  const [attemptQuestions, setAttemptQuestions] = useState<QuizQuestion[]>([]);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const submittingRef = useRef(false);

  const questions = useMemo(
    () => (session ? resolveSessionQuestions(session, QUIZ_QUESTIONS) : []),
    [session],
  );

  // Restore an unfinished exam on mount.
  useEffect(() => {
    const stored = loadMockSession();
    setHydrated(true);
    if (!stored) return;
    if (resolveSessionQuestions(stored, QUIZ_QUESTIONS).length === 0) {
      clearMockSession();
      return;
    }
    setResumable(stored);
  }, []);

  const submitExam = useCallback(
    (submittedByTimeout: boolean) => {
      if (submittingRef.current || !session) return;
      const active = resolveSessionQuestions(session, QUIZ_QUESTIONS);
      if (active.length === 0) return;
      submittingRef.current = true;

      const duration = Math.min(
        elapsedSeconds(session),
        EXAM_TIME_LIMIT_MINUTES * 60,
      );
      const nextAttempt = buildMockAttempt(
        active,
        session.answers,
        session.markedQuestionIds,
        duration,
        submittedByTimeout,
        session.attemptId,
      );

      recordMockExamAttempt(loadProgress(), nextAttempt, active);
      clearMockSession();
      setAttemptQuestions(active);
      setAttempt(nextAttempt);
      setPhase("submitted");
      setConfirmingSubmit(false);
    },
    [session],
  );

  // Tick the clock. The deadline is absolute, so a refresh cannot reset it.
  useEffect(() => {
    if (phase !== "running") return;
    const timer = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [phase]);

  // Auto-submit at the deadline.
  useEffect(() => {
    if (phase !== "running" || !session) return;
    if (remainingSeconds(session, nowMs) === 0) {
      submitExam(true);
    }
  }, [nowMs, phase, session, submitExam]);

  // Warn before leaving an exam in progress.
  useEffect(() => {
    if (phase !== "running") return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [phase]);

  const updateSession = useCallback(
    (updater: (current: MockExamSessionState) => MockExamSessionState) => {
      setSession((current) => {
        if (!current) return current;
        const next = updater(current);
        saveMockSession(next);
        return next;
      });
    },
    [],
  );

  function startExam() {
    submittingRef.current = false;
    const next = createMockSession(QUIZ_QUESTIONS);
    saveMockSession(next);
    setSession(next);
    setResumable(null);
    setAttempt(null);
    setNowMs(Date.now());
    setPhase("running");
  }

  function resumeExam(state: MockExamSessionState) {
    submittingRef.current = false;
    setSession(state);
    setResumable(null);
    setAttempt(null);
    setNowMs(Date.now());
    setPhase("running");
  }

  function discardExam() {
    clearMockSession();
    setResumable(null);
    setSession(null);
    setPhase("idle");
  }

  const currentQuestion = session ? questions[session.currentIndex] : undefined;
  const answeredCount = session ? Object.keys(session.answers).length : 0;
  const unansweredCount = questions.length - answeredCount;
  const markedSet = useMemo(
    () => new Set(session?.markedQuestionIds ?? []),
    [session],
  );

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-16 text-center text-muted sm:px-6">
        Loading mock exam…
      </div>
    );
  }

  // ---------------------------------------------------------------- results
  if (phase === "submitted" && attempt) {
    const answerMap = new Map(
      attempt.answers.map((answer) => [answer.questionId, answer]),
    );
    const incorrectQuestions = attemptQuestions.filter(
      (question) => !answerMap.get(question.id)?.isCorrect,
    );
    const markedQuestions = attemptQuestions.filter((question) =>
      attempt.markedQuestionIds.includes(question.id),
    );
    const sectionRows = buildPerformanceRows(attemptQuestions, attempt, "section");
    const difficultyRows = buildPerformanceRows(
      attemptQuestions,
      attempt,
      "difficulty",
    );

    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Mock exam results
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Score: {attempt.score} / {attempt.total}
          </h1>
          <p
            className="mt-2 text-sm text-muted"
            data-testid="mock-result-summary"
            data-passed={attempt.passed ? "true" : "false"}
            data-score={attempt.score}
          >
            <span
              className={
                attempt.passed
                  ? "font-semibold text-emerald-400"
                  : "font-semibold text-rose-400"
              }
            >
              {attempt.passed
                ? "At or above the pass mark"
                : "Below the pass mark"}
            </span>{" "}
            · {EXAM_PASSING_CORRECT_ANSWERS} of {EXAM_TOTAL_QUESTIONS} correct
            answers are required on the official exam · {attempt.percentage}%
            · Completed in {formatTime(attempt.durationSeconds)}
            {attempt.submittedByTimeout ? " · Auto-submitted at the deadline" : ""}
          </p>
          <p className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs leading-relaxed text-zinc-500">
            This is an unofficial pass estimate produced by an independent study
            tool. It uses the raw-score criterion published for exam {EXAM_CODE}
            , but it is not affiliated with or endorsed by IBM and does not
            predict your result on the real exam.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="card">
            <h2 className="text-lg font-semibold text-zinc-100">
              Section performance
            </h2>
            <div className="mt-4 space-y-3">
              {sectionRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3"
                >
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
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm capitalize text-zinc-300">
                    {row.label}
                  </span>
                  <span className="font-mono text-sm text-zinc-100">
                    {row.correct}/{row.total} · {row.accuracy}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            Incorrect and unanswered questions ({incorrectQuestions.length})
          </h2>
          {incorrectQuestions.length === 0 ? (
            <div className="card text-sm text-emerald-300">
              Every question was answered correctly.
            </div>
          ) : (
            <ul className="space-y-4">
              {incorrectQuestions.map((question) => (
                <QuestionReview
                  key={question.id}
                  question={question}
                  selectedChoiceId={
                    answerMap.get(question.id)?.selectedChoiceId ?? null
                  }
                />
              ))}
            </ul>
          )}
        </section>

        {markedQuestions.length > 0 ? (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-zinc-100">
              Questions you marked for review ({markedQuestions.length})
            </h2>
            <ul className="space-y-4">
              {markedQuestions.map((question) => (
                <QuestionReview
                  key={question.id}
                  question={question}
                  selectedChoiceId={
                    answerMap.get(question.id)?.selectedChoiceId ?? null
                  }
                />
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={startExam}
            className="rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-500"
          >
            Start another mock exam
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
          >
            View dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------- idle
  if (phase !== "running" || !session) {
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
            {EXAM_TOTAL_QUESTIONS} questions in{" "}
            {EXAM_TIME_LIMIT_MINUTES} minutes, weighted across all eight{" "}
            {EXAM_CODE} sections. Section, difficulty, and explanations stay
            hidden until you submit.
          </p>
        </header>

        {resumable ? (
          <section className="card mb-6 border-amber-800/60" data-testid="resume-prompt">
            <h2 className="text-lg font-semibold text-amber-200">
              You have an exam in progress
            </h2>
            <p className="mt-2 text-sm text-zinc-300">
              {Object.keys(resumable.answers).length} of{" "}
              {resumable.questionIds.length} answered ·{" "}
              {formatTime(remainingSeconds(resumable))} remaining on the original
              deadline.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => resumeExam(resumable)}
                data-testid="resume-exam"
                className="rounded-lg bg-amber-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
              >
                Resume exam
              </button>
              <button
                type="button"
                onClick={discardExam}
                className="rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
              >
                Discard and start fresh
              </button>
            </div>
          </section>
        ) : null}

        <section className="card">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="font-mono text-3xl font-semibold text-zinc-100">
                {EXAM_TOTAL_QUESTIONS}
              </p>
              <p className="mt-1 text-xs text-zinc-500">Questions</p>
            </div>
            <div>
              <p className="font-mono text-3xl font-semibold text-zinc-100">
                {EXAM_TIME_LIMIT_MINUTES}
              </p>
              <p className="mt-1 text-xs text-zinc-500">Minutes</p>
            </div>
            <div>
              <p className="font-mono text-3xl font-semibold text-zinc-100">
                {EXAM_PASSING_CORRECT_ANSWERS}
              </p>
              <p className="mt-1 text-xs text-zinc-500">Correct answers to pass</p>
            </div>
          </div>
          <button
            type="button"
            onClick={startExam}
            data-testid="start-exam"
            className="mt-8 rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-500"
          >
            {resumable ? "Start a new exam" : "Start mock exam"}
          </button>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Qisquiz is an independent study tool, not affiliated with or endorsed
            by IBM. Results are an unofficial estimate.
          </p>
        </section>
      </div>
    );
  }

  // ---------------------------------------------------------------- running
  const secondsLeft = remainingSeconds(session, nowMs);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Mock exam
          </p>
          <h1 className="mt-1 text-xl font-semibold text-foreground">
            Question {session.currentIndex + 1} of {questions.length}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {answeredCount} answered · {session.markedQuestionIds.length} marked
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <p
            className={`font-mono text-2xl font-semibold ${
              secondsLeft < 600 ? "text-rose-300" : "text-zinc-100"
            }`}
            aria-label={`Time remaining ${formatTime(secondsLeft)}`}
            data-testid="exam-timer"
          >
            {formatTime(secondsLeft)}
          </p>
          <button
            type="button"
            onClick={() => setConfirmingSubmit(true)}
            data-testid="submit-exam"
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-white"
          >
            Submit exam
          </button>
        </div>
      </header>

      {confirmingSubmit ? (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="submit-confirm-title"
          data-testid="submit-confirm"
          className="mb-6 rounded-lg border border-amber-700/70 bg-amber-950/20 p-4"
        >
          <h2
            id="submit-confirm-title"
            className="text-sm font-semibold text-amber-200"
          >
            Submit this exam?
          </h2>
          <p className="mt-2 text-sm text-zinc-300">
            {unansweredCount === 0
              ? "All questions are answered."
              : `${unansweredCount} question${unansweredCount === 1 ? " is" : "s are"} unanswered and will be scored as incorrect.`}{" "}
            You cannot change answers after submitting.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => submitExam(false)}
              data-testid="confirm-submit"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
            >
              Submit now
            </button>
            <button
              type="button"
              onClick={() => setConfirmingSubmit(false)}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              Keep working
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="card h-fit">
          <h2 className="text-sm font-semibold text-zinc-100">Progress</h2>
          <div className="mt-4 grid grid-cols-5 gap-2 lg:grid-cols-4">
            {questions.map((question, index) => {
              const answered = session.answers[question.id] !== undefined;
              const marked = markedSet.has(question.id);
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() =>
                    updateSession((current) => ({ ...current, currentIndex: index }))
                  }
                  className={`h-9 rounded-lg border text-xs font-semibold transition-colors ${
                    index === session.currentIndex
                      ? "border-cyan-500 bg-cyan-950/40 text-cyan-200"
                      : answered
                        ? "border-emerald-800 bg-emerald-950/20 text-emerald-200"
                        : "border-zinc-800 bg-zinc-950/40 text-zinc-400"
                  } ${marked ? "ring-1 ring-amber-400/70" : ""}`}
                  aria-label={`Go to question ${index + 1}${answered ? ", answered" : ", unanswered"}${marked ? ", marked" : ""}`}
                  aria-current={index === session.currentIndex ? "true" : undefined}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </aside>

        {currentQuestion ? (
          <article className="card">
            {/*
              During the exam no section, difficulty, tag, type, or objective is
              shown: those labels narrow the answer set and are not part of a
              realistic mixed sitting.
            */}
            <button
              type="button"
              onClick={() =>
                updateSession((current) => ({
                  ...current,
                  markedQuestionIds: current.markedQuestionIds.includes(
                    currentQuestion.id,
                  )
                    ? current.markedQuestionIds.filter(
                        (id) => id !== currentQuestion.id,
                      )
                    : [...current.markedQuestionIds, currentQuestion.id],
                }))
              }
              className="mb-5 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
              aria-pressed={markedSet.has(currentQuestion.id)}
            >
              {markedSet.has(currentQuestion.id)
                ? "Marked for review"
                : "Mark for review"}
            </button>

            <h2 className="text-lg font-medium leading-snug text-zinc-100 sm:text-xl">
              {currentQuestion.question}
            </h2>

            {currentQuestion.code ? (
              <div className="mt-5">
                <CodeBlock
                  code={currentQuestion.code}
                  language={currentQuestion.codeLanguage ?? "python"}
                />
              </div>
            ) : null}

            <div className="mt-8">
              <AnswerChoiceList
                choices={
                  presentWithOrder(
                    currentQuestion,
                    session.choiceOrder[currentQuestion.id] ??
                      currentQuestion.choices.map((choice) => choice.id),
                  ).displayChoices
                }
                selectedChoiceId={session.answers[currentQuestion.id] ?? null}
                revealed={false}
                onSelect={(choiceId: ChoiceId) =>
                  updateSession((current) => ({
                    ...current,
                    answers: { ...current.answers, [currentQuestion.id]: choiceId },
                  }))
                }
                label={`Answer choices for question ${session.currentIndex + 1}`}
              />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() =>
                  updateSession((current) => ({
                    ...current,
                    currentIndex: Math.max(0, current.currentIndex - 1),
                  }))
                }
                disabled={session.currentIndex === 0}
                className="rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  updateSession((current) => ({
                    ...current,
                    currentIndex: Math.min(
                      questions.length - 1,
                      current.currentIndex + 1,
                    ),
                  }))
                }
                disabled={session.currentIndex === questions.length - 1}
                data-testid="next-exam-question"
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
