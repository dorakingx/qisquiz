"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ChoiceId,
  PresentedQuestion,
  QuizAnswer,
  QuizQuestion,
  StudyConfig,
  StudyProgress,
} from "@/types/quiz";
import {
  createEmptyProgress,
  loadProgress,
  recordStudyAnswer,
  recordStudyPreference,
  toggleBookmark,
} from "@/lib/progress";
import { presentQuestions } from "@/lib/quiz";
import { QuizCard } from "./QuizCard";
import { ScoreSummary } from "./ScoreSummary";

type QuizProps = {
  questions: QuizQuestion[];
  studyConfig: StudyConfig;
};

export function Quiz({ questions, studyConfig }: QuizProps) {
  const total = questions.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<ChoiceId | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [progress, setProgress] = useState<StudyProgress>(createEmptyProgress);

  // Choice order is shuffled once per session so a fixed authored order can
  // never become a positional tell.
  const presentedQuestions: PresentedQuestion[] = useMemo(
    () => presentQuestions(questions),
    [questions],
  );

  useEffect(() => {
    const stored = loadProgress();
    const selectedSection =
      studyConfig.sections === "all" || studyConfig.sections.length !== 1
        ? "all"
        : studyConfig.sections[0];
    setProgress(
      recordStudyPreference(stored, selectedSection, studyConfig.difficulty),
    );
  }, [studyConfig.difficulty, studyConfig.sections]);

  const presented = presentedQuestions[currentIndex];
  const question = presented?.question;

  const handleSelect = useCallback(
    (choiceId: ChoiceId) => {
      if (showFeedback || !question) return;
      setSelectedChoiceId(choiceId);
      setShowFeedback(true);
      setProgress((prev) => recordStudyAnswer(prev, question, choiceId));
      setAnswers((prev) => [
        ...prev,
        {
          questionId: question.id,
          selectedChoiceId: choiceId,
          isCorrect: choiceId === question.correctChoiceId,
        },
      ]);
    },
    [question, showFeedback],
  );

  const handleNext = useCallback(() => {
    if (!showFeedback) return;
    if (currentIndex >= total - 1) {
      setFinished(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedChoiceId(null);
    setShowFeedback(false);
  }, [currentIndex, showFeedback, total]);

  const handleToggleBookmark = useCallback(() => {
    if (!question) return;
    setProgress((prev) => toggleBookmark(prev, question.id));
  }, [question]);

  if (total === 0) {
    return (
      <div className="card text-center">
        <p className="text-zinc-300">No questions match your study filters.</p>
        <a
          href="/topics"
          className="mt-4 inline-block text-sm text-accent hover:underline"
        >
          Adjust topics and filters
        </a>
      </div>
    );
  }

  if (finished) {
    return (
      <ScoreSummary
        answers={answers}
        questions={questions}
        studyConfig={studyConfig}
      />
    );
  }

  if (!presented) return null;

  return (
    <div className="w-full max-w-3xl">
      <QuizCard
        presented={presented}
        questionNumber={currentIndex + 1}
        totalQuestions={total}
        selectedChoiceId={selectedChoiceId}
        showFeedback={showFeedback}
        bookmarked={progress.bookmarkedQuestionIds.includes(presented.question.id)}
        onSelect={handleSelect}
        onToggleBookmark={handleToggleBookmark}
      />

      {showFeedback ? (
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            data-testid="next-question"
            className="rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white"
          >
            {currentIndex >= total - 1 ? "View results" : "Next question"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
