"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { QuizAnswer, QuizQuestion, StudyConfig } from "@/types/quiz";
import type { StudyProgress } from "@/types/quiz";
import {
  createEmptyProgress,
  loadProgress,
  recordStudyAnswer,
  recordStudyPreference,
  toggleBookmark,
} from "@/lib/progress";
import { QuizCard } from "./QuizCard";
import { ScoreSummary } from "./ScoreSummary";

type QuizProps = {
  questions: QuizQuestion[];
  studyConfig: StudyConfig;
};

export function Quiz({ questions, studyConfig }: QuizProps) {
  const total = questions.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [progress, setProgress] = useState<StudyProgress>(createEmptyProgress);

  useEffect(() => {
    const stored = loadProgress();
    setProgress(stored);
    const selectedSection =
      studyConfig.sections === "all" || studyConfig.sections.length !== 1
        ? "all"
        : studyConfig.sections[0];
    setProgress(
      recordStudyPreference(
        stored,
        selectedSection,
        studyConfig.difficulty,
      ),
    );
  }, [studyConfig.difficulty, studyConfig.sections]);

  const question = useMemo(
    () => questions[currentIndex],
    [questions, currentIndex],
  );

  const handleSelect = useCallback(
    (index: number) => {
      if (showFeedback || !question) return;
      setSelectedIndex(index);
      setShowFeedback(true);
      setProgress((prev) => recordStudyAnswer(prev, question, index));
      setAnswers((prev) => [
        ...prev,
        {
          questionId: question.id,
          selectedIndex: index,
          isCorrect: index === question.correctAnswerIndex,
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
    setSelectedIndex(null);
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

  return (
    <div className="w-full max-w-3xl">
      <QuizCard
        question={question}
        questionNumber={currentIndex + 1}
        totalQuestions={total}
        selectedIndex={selectedIndex}
        showFeedback={showFeedback}
        bookmarked={progress.bookmarkedQuestionIds.includes(question.id)}
        onSelect={handleSelect}
        onToggleBookmark={handleToggleBookmark}
      />

      {showFeedback ? (
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            className="rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white"
          >
            {currentIndex >= total - 1 ? "View results" : "Next question"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
