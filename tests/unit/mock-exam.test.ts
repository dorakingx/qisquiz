import { describe, expect, it } from "vitest";
import {
  EXAM_TOTAL_QUESTIONS,
  MOCK_EXAM_SECTION_TARGETS,
} from "@/config/exam";
import { QUIZ_QUESTIONS } from "@/data/questions";
import { buildMockExamSession, presentWithOrder } from "@/lib/quiz";
import { buildMockAttempt } from "@/lib/progress";
import { createMockSession, normalizeMockSession, remainingSeconds } from "@/lib/mock-exam-session";
import type { ChoiceId, QuizQuestion } from "@/types/quiz";

function answerAll(
  questions: QuizQuestion[],
  correctCount: number,
): Record<string, ChoiceId> {
  const answers: Record<string, ChoiceId> = {};
  questions.forEach((question, index) => {
    if (index < correctCount) {
      answers[question.id] = question.correctChoiceId;
    } else {
      const wrong = question.choices.find(
        (choice) => choice.id !== question.correctChoiceId,
      )!;
      answers[question.id] = wrong.id;
    }
  });
  return answers;
}

describe("mock exam generation", () => {
  it("produces exactly the official number of questions", () => {
    const session = buildMockExamSession(QUIZ_QUESTIONS);
    expect(session).toHaveLength(EXAM_TOTAL_QUESTIONS);
  });

  it("never repeats a question within one sitting", () => {
    for (let run = 0; run < 25; run++) {
      const session = buildMockExamSession(QUIZ_QUESTIONS);
      expect(new Set(session.map((q) => q.id)).size).toBe(session.length);
    }
  });

  it("follows the configured per-section targets", () => {
    for (let run = 0; run < 10; run++) {
      const session = buildMockExamSession(QUIZ_QUESTIONS);
      const counts: Record<number, number> = {};
      for (const question of session) {
        counts[question.section] = (counts[question.section] ?? 0) + 1;
      }
      for (const [section, target] of Object.entries(MOCK_EXAM_SECTION_TARGETS)) {
        expect(counts[Number(section)]).toBe(target);
      }
    }
  });

  it("leaves the source bank untouched", () => {
    const before = QUIZ_QUESTIONS.map((q) => q.id).join(",");
    const length = QUIZ_QUESTIONS.length;
    buildMockExamSession(QUIZ_QUESTIONS);
    expect(QUIZ_QUESTIONS).toHaveLength(length);
    expect(QUIZ_QUESTIONS.map((q) => q.id).join(",")).toBe(before);
  });

  it("is reproducible when a seed is supplied", () => {
    const a = buildMockExamSession(QUIZ_QUESTIONS, 12345).map((q) => q.id);
    const b = buildMockExamSession(QUIZ_QUESTIONS, 12345).map((q) => q.id);
    expect(a).toEqual(b);
  });
});

describe("mock exam scoring", () => {
  const questions = buildMockExamSession(QUIZ_QUESTIONS, 7);

  it("classifies 47 of 68 as a pass", () => {
    const attempt = buildMockAttempt(questions, answerAll(questions, 47), [], 100, false);
    expect(attempt.score).toBe(47);
    expect(attempt.total).toBe(68);
    expect(attempt.passed).toBe(true);
  });

  it("classifies 46 of 68 as a fail", () => {
    const attempt = buildMockAttempt(questions, answerAll(questions, 46), [], 100, false);
    expect(attempt.score).toBe(46);
    expect(attempt.passed).toBe(false);
  });

  it("classifies 68 of 68 as a pass", () => {
    const attempt = buildMockAttempt(questions, answerAll(questions, 68), [], 100, false);
    expect(attempt.score).toBe(68);
    expect(attempt.passed).toBe(true);
  });

  it("counts unanswered questions as incorrect", () => {
    const partial = answerAll(questions, 68);
    // Remove 21 answers, leaving 47 correct out of 68.
    for (const question of questions.slice(47)) {
      delete partial[question.id];
    }
    const attempt = buildMockAttempt(questions, partial, [], 100, false);
    expect(attempt.score).toBe(47);
    expect(attempt.total).toBe(68);
    expect(attempt.passed).toBe(true);
    expect(attempt.answers.filter((a) => a.selectedChoiceId === null)).toHaveLength(21);
  });

  it("records an answer for every question, answered or not", () => {
    const attempt = buildMockAttempt(questions, {}, [], 10, true);
    expect(attempt.answers).toHaveLength(68);
    expect(attempt.score).toBe(0);
    expect(attempt.passed).toBe(false);
    expect(attempt.submittedByTimeout).toBe(true);
  });

  it("never lets a rounded percentage contradict the raw criterion", () => {
    const attempt = buildMockAttempt(questions, answerAll(questions, 47), [], 100, false);
    expect(attempt.percentage).toBe(69);
    expect(attempt.passed).toBe(true);
  });
});

describe("mock exam session state", () => {
  it("freezes a choice order for every question", () => {
    const session = createMockSession(QUIZ_QUESTIONS, 1_700_000_000_000);
    expect(session.questionIds).toHaveLength(EXAM_TOTAL_QUESTIONS);
    for (const id of session.questionIds) {
      expect(session.choiceOrder[id]).toHaveLength(4);
      expect(new Set(session.choiceOrder[id]).size).toBe(4);
    }
  });

  it("sets an absolute deadline that a reload cannot extend", () => {
    const start = 1_700_000_000_000;
    const session = createMockSession(QUIZ_QUESTIONS, start);
    expect(session.deadlineMs - session.startedAtMs).toBe(90 * 60 * 1000);
    expect(remainingSeconds(session, start + 60_000)).toBe(90 * 60 - 60);
    // Re-reading the same stored state later gives less time, not a reset.
    expect(remainingSeconds(session, start + 89 * 60_000)).toBe(60);
    expect(remainingSeconds(session, start + 100 * 60_000)).toBe(0);
  });

  it("round-trips through JSON without losing the deadline or answers", () => {
    const session = createMockSession(QUIZ_QUESTIONS, 1_700_000_000_000);
    session.answers[session.questionIds[0]] = "c";
    session.markedQuestionIds.push(session.questionIds[1]);
    const restored = normalizeMockSession(JSON.parse(JSON.stringify(session)));
    expect(restored).not.toBeNull();
    expect(restored!.deadlineMs).toBe(session.deadlineMs);
    expect(restored!.answers).toEqual(session.answers);
    expect(restored!.markedQuestionIds).toEqual(session.markedQuestionIds);
    expect(restored!.choiceOrder).toEqual(session.choiceOrder);
  });

  it("rejects corrupted or foreign stored state", () => {
    expect(normalizeMockSession(null)).toBeNull();
    expect(normalizeMockSession("not an object")).toBeNull();
    expect(normalizeMockSession({ version: 1, questionIds: ["s1-001"] })).toBeNull();
    expect(normalizeMockSession({ version: 2, questionIds: [] })).toBeNull();
    expect(
      normalizeMockSession({ version: 2, questionIds: ["s1-001"], deadlineMs: "soon" }),
    ).toBeNull();
  });

  it("drops stored answers that are not valid choice ids", () => {
    const session = createMockSession(QUIZ_QUESTIONS, 1_700_000_000_000);
    const raw = JSON.parse(JSON.stringify(session));
    raw.answers = { [session.questionIds[0]]: "z", [session.questionIds[1]]: "b" };
    const restored = normalizeMockSession(raw)!;
    expect(restored.answers).toEqual({ [session.questionIds[1]]: "b" });
  });

  it("keeps grading correct after the display order is shuffled", () => {
    const session = createMockSession(QUIZ_QUESTIONS, 1_700_000_000_000);
    const byId = new Map(QUIZ_QUESTIONS.map((q) => [q.id, q]));
    for (const id of session.questionIds) {
      const question = byId.get(id)!;
      const presented = presentWithOrder(question, session.choiceOrder[id]);
      expect(presented.displayChoices).toHaveLength(4);
      // The correct choice is still identified by id, wherever it is displayed.
      const shown = presented.displayChoices.find(
        (c) => c.id === question.correctChoiceId,
      );
      expect(shown).toBeDefined();
      expect(shown!.text).toBe(
        question.choices.find((c) => c.id === question.correctChoiceId)!.text,
      );
    }
  });
});
