import { describe, expect, it } from "vitest";
import {
  EXAM_CODE,
  EXAM_PASSING_CORRECT_ANSWERS,
  EXAM_SECTIONS,
  EXAM_TIME_LIMIT_MINUTES,
  EXAM_TIME_LIMIT_SECONDS,
  EXAM_TOTAL_QUESTIONS,
  MOCK_EXAM_SECTION_TARGETS,
  QUESTION_BANK_MINIMUM,
  QUESTION_BANK_SECTION_TARGETS,
  distributeByWeight,
  isPassingRawScore,
  requiredCorrectAnswers,
} from "@/config/exam";

describe("official exam configuration", () => {
  it("matches the values published for C1000-179", () => {
    expect(EXAM_CODE).toBe("C1000-179");
    expect(EXAM_TOTAL_QUESTIONS).toBe(68);
    expect(EXAM_PASSING_CORRECT_ANSWERS).toBe(47);
    expect(EXAM_TIME_LIMIT_MINUTES).toBe(90);
    expect(EXAM_TIME_LIMIT_SECONDS).toBe(5400);
  });

  it("uses the published section weights, summing to 100 percent", () => {
    expect(EXAM_SECTIONS.map((s) => s.weightPercent)).toEqual([
      16, 11, 18, 15, 12, 12, 10, 6,
    ]);
    const total = EXAM_SECTIONS.reduce((sum, s) => sum + s.weightPercent, 0);
    expect(total).toBe(100);
  });
});

describe("pass/fail uses the official raw score, never a percentage", () => {
  it("passes at exactly 47 of 68", () => {
    expect(isPassingRawScore(47, 68)).toBe(true);
  });

  it("fails at 46 of 68", () => {
    expect(isPassingRawScore(46, 68)).toBe(false);
  });

  it("passes at 68 of 68", () => {
    expect(isPassingRawScore(68, 68)).toBe(true);
  });

  it("fails at 0 of 68", () => {
    expect(isPassingRawScore(0, 68)).toBe(false);
  });

  it("does not use a 70 percent rule, which would wrongly fail 47/68", () => {
    // 47/68 is 69.1%, and rounds to 69%. A percentage rule would fail it.
    const percentage = Math.round((47 / 68) * 100);
    expect(percentage).toBeLessThan(70);
    expect(isPassingRawScore(47, 68)).toBe(true);
  });

  it("reports 47 as the requirement for a standard sitting", () => {
    expect(requiredCorrectAnswers(68)).toBe(47);
  });

  it("scales the ratio for non-standard sitting lengths", () => {
    expect(requiredCorrectAnswers(10)).toBe(7);
    expect(isPassingRawScore(7, 10)).toBe(true);
    expect(isPassingRawScore(6, 10)).toBe(false);
  });
});

describe("weighted distribution", () => {
  it("splits a 68-question sitting into the expected section targets", () => {
    expect(MOCK_EXAM_SECTION_TARGETS).toEqual({
      1: 11,
      2: 8,
      3: 12,
      4: 10,
      5: 8,
      6: 8,
      7: 7,
      8: 4,
    });
  });

  it("always sums to the requested total", () => {
    for (const total of [10, 68, 100, 320, 321, 1000]) {
      const parts = distributeByWeight(total);
      const sum = Object.values(parts).reduce((a, b) => a + b, 0);
      expect(sum).toBe(total);
    }
  });

  it("derives the bank targets from the same weights", () => {
    const sum = Object.values(QUESTION_BANK_SECTION_TARGETS).reduce(
      (a, b) => a + b,
      0,
    );
    expect(sum).toBe(QUESTION_BANK_MINIMUM);
    expect(QUESTION_BANK_SECTION_TARGETS[3]).toBeGreaterThan(
      QUESTION_BANK_SECTION_TARGETS[8],
    );
  });
});
