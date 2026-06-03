"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Quiz } from "@/components/Quiz";
import { QUIZ_QUESTIONS } from "@/data/questions";
import {
  buildQuizSession,
  parseStudyConfig,
} from "@/lib/quiz";

function QuizSession() {
  const searchParams = useSearchParams();
  const studyConfig = parseStudyConfig(searchParams);
  const retryParam = searchParams.get("retry") ?? "";

  const questions = useMemo(() => {
    const config = parseStudyConfig(searchParams);
    const retryIds = retryParam ? retryParam.split(",").filter(Boolean) : [];
    return buildQuizSession(QUIZ_QUESTIONS, config, retryIds);
  }, [searchParams, retryParam]);

  const retryIds = retryParam ? retryParam.split(",").filter(Boolean) : [];

  const sessionLabel =
    retryIds.length > 0
      ? "Retry session"
      : studyConfig.section === "all"
        ? "Full quiz"
        : `Section ${studyConfig.section}`;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">
          {sessionLabel}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Quiz</h1>
        <p className="mt-1 text-sm text-muted">
          {questions.length} question{questions.length === 1 ? "" : "s"}
          {studyConfig.difficulty !== "all"
            ? ` · ${studyConfig.difficulty}`
            : ""}
          {studyConfig.order === "random" ? " · randomized" : ""}
        </p>
      </header>
      <Quiz questions={questions} studyConfig={studyConfig} />
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted">
          Loading quiz…
        </div>
      }
    >
      <QuizSession />
    </Suspense>
  );
}
