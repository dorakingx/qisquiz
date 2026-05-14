"use client";

import { useCallback, useMemo, useState } from "react";
import { QUIZ_QUESTIONS } from "@/data/questions";
import { FeedbackPanel } from "./FeedbackPanel";
import { QuestionView } from "./QuestionView";
import { ResultsSummary } from "./ResultsSummary";

export function Quiz() {
  const total = QUIZ_QUESTIONS.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [finished, setFinished] = useState(false);

  const question = useMemo(
    () => QUIZ_QUESTIONS[currentIndex],
    [currentIndex],
  );

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedChoiceId(null);
    setShowFeedback(false);
    setFinished(false);
  }, []);

  const handleSelectChoice = useCallback(
    (choiceId: string) => {
      if (showFeedback) return;
      setSelectedChoiceId(choiceId);
      setShowFeedback(true);
      if (choiceId === question.correctChoiceId) {
        setScore((s) => s + 1);
      }
    },
    [question.correctChoiceId, showFeedback],
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

  if (finished) {
    return <ResultsSummary score={score} total={total} onRetry={reset} />;
  }

  const answeredCorrectly =
    selectedChoiceId !== null && selectedChoiceId === question.correctChoiceId;

  return (
    <div className="w-full max-w-3xl">
      <QuestionView
        question={question}
        questionNumber={currentIndex + 1}
        totalQuestions={total}
        selectedChoiceId={selectedChoiceId}
        showFeedback={showFeedback}
        correctChoiceId={question.correctChoiceId}
        onSelectChoice={handleSelectChoice}
      />

      {showFeedback && selectedChoiceId !== null ? (
        <FeedbackPanel
          isCorrect={answeredCorrectly}
          explanation={question.explanation}
        />
      ) : null}

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
