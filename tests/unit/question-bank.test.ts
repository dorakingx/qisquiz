import { describe, expect, it } from "vitest";
import { QUESTION_BANK_MINIMUM, QUESTION_BANK_SECTION_TARGETS } from "@/config/exam";
import { QUIZ_QUESTIONS, getQuestionById } from "@/data/questions";
import {
  buildQuizUrl,
  filterQuestions,
  orderQuestions,
  parseRetryIds,
  parseStudyConfig,
  presentQuestion,
} from "@/lib/quiz";
import {
  findAnswerLeaks,
  findDuplicates,
  jaccard,
  normalizeText,
  trigrams,
} from "@/lib/quality";
import { CHOICE_IDS, RECALL_QUESTION_TYPES, isCodeQuestion } from "@/types/quiz";
import type { QuizQuestion } from "@/types/quiz";

/** Every id published before the rebuild must still resolve. */
const PROTECTED_IDS = Array.from({ length: 8 }, (_, s) =>
  Array.from({ length: 15 }, (_, i) => `s${s + 1}-${String(i + 1).padStart(3, "0")}`),
).flat();

describe("question bank integrity", () => {
  it("meets the minimum size", () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(QUESTION_BANK_MINIMUM);
  });

  it("has unique, explicitly authored ids", () => {
    const ids = QUIZ_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^s[1-8]-\d{3}$/);
  });

  it("preserves every previously published id", () => {
    for (const id of PROTECTED_IDS) {
      expect(getQuestionById(id), `missing ${id}`).toBeDefined();
    }
  });

  it("keeps ids independent of array position", () => {
    // Reordering the bank must not change which question an id resolves to.
    const reversed = [...QUIZ_QUESTIONS].reverse();
    const byId = new Map(reversed.map((q) => [q.id, q]));
    for (const question of QUIZ_QUESTIONS) {
      expect(byId.get(question.id)!.question).toBe(question.question);
    }
  });

  it("gives every question four stable choice ids and a valid key", () => {
    for (const question of QUIZ_QUESTIONS) {
      expect(question.choices).toHaveLength(4);
      const ids = question.choices.map((c) => c.id);
      expect(new Set(ids).size).toBe(4);
      for (const id of ids) expect(CHOICE_IDS).toContain(id);
      expect(ids).toContain(question.correctChoiceId);
    }
  });

  it("gives every question an exact reference and a review date", () => {
    for (const question of QUIZ_QUESTIONS) {
      expect(question.referenceUrls.length).toBeGreaterThan(0);
      for (const url of question.referenceUrls) {
        expect(() => new URL(url)).not.toThrow();
        expect(url.startsWith("https://")).toBe(true);
      }
      expect(question.lastReviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(question.qiskitVersion).toBeTruthy();
    }
  });

  it("meets the per-section blueprint targets", () => {
    for (const [section, target] of Object.entries(QUESTION_BANK_SECTION_TARGETS)) {
      const count = QUIZ_QUESTIONS.filter(
        (q) => q.section === Number(section),
      ).length;
      expect(count, `section ${section}`).toBeGreaterThanOrEqual(target);
    }
  });

  it("meets the diversity requirements", () => {
    const total = QUIZ_QUESTIONS.length;
    const code = QUIZ_QUESTIONS.filter(isCodeQuestion).length;
    expect(code / total).toBeGreaterThanOrEqual(0.45);

    const recall = QUIZ_QUESTIONS.filter((q) =>
      RECALL_QUESTION_TYPES.includes(q.questionType),
    ).length;
    expect(recall / total).toBeLessThanOrEqual(0.2);

    const byType = new Map<string, number>();
    for (const q of QUIZ_QUESTIONS) {
      byType.set(q.questionType, (byType.get(q.questionType) ?? 0) + 1);
    }
    for (const [, count] of byType) expect(count / total).toBeLessThanOrEqual(0.3);

    for (let section = 1; section <= 8; section++) {
      const list = QUIZ_QUESTIONS.filter((q) => q.section === section);
      expect(new Set(list.map((q) => q.questionType)).size).toBeGreaterThanOrEqual(4);
      expect(new Set(list.map((q) => q.difficulty)).size).toBe(3);
    }
  });
});

describe("answer-leak detector", () => {
  it("finds no leak in the published bank", () => {
    const leaks = QUIZ_QUESTIONS.flatMap(findAnswerLeaks);
    expect(leaks.map((l) => `${l.questionId} ${l.rule}`)).toEqual([]);
  });

  it("catches the correct answer printed verbatim in the code", () => {
    const bad: QuizQuestion = {
      ...QUIZ_QUESTIONS[0],
      id: "s1-999",
      code: "qc.measure_all()",
      codeStatus: "illustrative",
      question: "Which method measures every qubit?",
      choices: [
        { id: "a", text: "qc.measure_all()" },
        { id: "b", text: "qc.draw()" },
        { id: "c", text: "qc.reset(0)" },
        { id: "d", text: "qc.barrier()" },
      ],
      correctChoiceId: "a",
    };
    const rules = findAnswerLeaks(bad).map((issue) => issue.rule);
    expect(rules).toContain("EXACT_ANSWER_IN_CODE");
  });

  it("catches an answer identifier revealed by an import line", () => {
    const bad: QuizQuestion = {
      ...QUIZ_QUESTIONS[0],
      id: "s1-998",
      code: "from qiskit.circuit import Parameter\n\nqc.ry(theta, 0)",
      codeStatus: "illustrative",
      question: "Which class holds a symbolic angle?",
      choices: [
        { id: "a", text: "Parameter" },
        { id: "b", text: "Statevector" },
        { id: "c", text: "ClassicalRegister" },
        { id: "d", text: "BackendV2" },
      ],
      correctChoiceId: "a",
    };
    const rules = findAnswerLeaks(bad).map((issue) => issue.rule);
    expect(rules).toContain("ANSWER_IDENTIFIER_IN_IMPORT");
  });

  it("catches an answer identifier hidden in the tags", () => {
    const bad: QuizQuestion = {
      ...QUIZ_QUESTIONS[0],
      id: "s1-997",
      code: undefined,
      codeStatus: "none",
      question: "Which function builds a preset pipeline?",
      choices: [
        { id: "a", text: "generate_preset_pass_manager" },
        { id: "b", text: "plot_histogram" },
        { id: "c", text: "qasm3.dumps" },
        { id: "d", text: "service.backend" },
      ],
      correctChoiceId: "a",
      tags: ["generate_preset_pass_manager", "transpilation"],
    };
    const rules = findAnswerLeaks(bad).map((issue) => issue.rule);
    expect(rules).toContain("METADATA_LEAK");
  });

  it("catches a completion snippet that already contains the answer", () => {
    const bad: QuizQuestion = {
      ...QUIZ_QUESTIONS[0],
      id: "s1-996",
      code: 'qc.draw(output="mpl")\n_____',
      codeStatus: "partial-completion",
      question: "Which argument selects Matplotlib output?",
      choices: [
        { id: "a", text: 'output="mpl"' },
        { id: "b", text: 'style="mpl"' },
        { id: "c", text: 'format="mpl"' },
        { id: "d", text: 'render="mpl"' },
      ],
      correctChoiceId: "a",
    };
    const rules = findAnswerLeaks(bad).map((issue) => issue.rule);
    expect(rules).toContain("PLACEHOLDER_ANSWER_LEAK");
  });

  it("does not flag a behavior question that legitimately shows a full call", () => {
    const fine: QuizQuestion = {
      ...QUIZ_QUESTIONS[0],
      id: "s1-995",
      code: "counts = result[0].data.meas.get_counts()",
      codeStatus: "illustrative",
      question: "What does the returned mapping contain?",
      choices: [
        { id: "a", text: "One entry per observed bitstring, holding its shot tally" },
        { id: "b", text: "One entry per qubit, holding its expectation value" },
        { id: "c", text: "One entry per gate, holding its duration" },
        { id: "d", text: "One entry per job, holding its status" },
      ],
      correctChoiceId: "a",
      tags: ["sampler-v2"],
      concept: "Counts",
      objective: "Read sampled data",
    };
    expect(findAnswerLeaks(fine)).toEqual([]);
  });
});

describe("duplicate detector", () => {
  it("finds no exact or strong near-duplicates in the bank", () => {
    const { exact, strong } = findDuplicates(QUIZ_QUESTIONS);
    expect(exact).toEqual([]);
    expect(strong).toEqual([]);
  });

  it("flags a superficial variant that only renames a variable", () => {
    const base = QUIZ_QUESTIONS.find((q) => q.code)!;
    const clone: QuizQuestion = {
      ...base,
      id: "s1-994",
      code: base.code!.replace(/\bqc\b/g, "circ"),
    };
    const { exact, strong } = findDuplicates([base, clone]);
    expect(exact.length + strong.length).toBe(1);
  });

  it("treats identical stems with different code as distinct", () => {
    const a = QUIZ_QUESTIONS.find((q) => q.code)!;
    const b: QuizQuestion = {
      ...a,
      id: "s1-993",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(9)\nfor i in range(9):\n    qc.h(i)\nqc.measure_all()",
      choices: a.choices.map((c) => ({ ...c, text: `${c.text} (variant)` })),
    };
    const { exact } = findDuplicates([a, b]);
    expect(exact).toEqual([]);
  });

  it("computes a sane similarity for unrelated text", () => {
    const low = jaccard(trigrams("what does a barrier do"), trigrams("session timeouts"));
    expect(low).toBeLessThan(0.3);
    expect(normalizeText("  Qc.Draw()  ")).toBe("qc.draw");
  });
});

describe("question filtering and session building", () => {
  it("filters by section, difficulty, tag, and type", () => {
    const bySection = filterQuestions(QUIZ_QUESTIONS, {
      sections: [3],
      difficulty: "all",
    });
    expect(bySection.every((q) => q.section === 3)).toBe(true);

    const byDifficulty = filterQuestions(QUIZ_QUESTIONS, {
      sections: "all",
      difficulty: "hard",
    });
    expect(byDifficulty.every((q) => q.difficulty === "hard")).toBe(true);

    const byTag = filterQuestions(QUIZ_QUESTIONS, {
      sections: "all",
      difficulty: "all",
      tag: "little-endian",
    });
    expect(byTag.length).toBeGreaterThan(0);
    expect(byTag.every((q) => q.tags.includes("little-endian"))).toBe(true);

    const byType = filterQuestions(QUIZ_QUESTIONS, {
      sections: "all",
      difficulty: "all",
      questionType: "debugging",
    });
    expect(byType.every((q) => q.questionType === "debugging")).toBe(true);
  });

  it("orders sequentially by section then id", () => {
    const ordered = orderQuestions(QUIZ_QUESTIONS, "sequential");
    for (let i = 1; i < ordered.length; i++) {
      const previous = ordered[i - 1];
      const current = ordered[i];
      expect(
        previous.section < current.section ||
          (previous.section === current.section && previous.id < current.id),
      ).toBe(true);
    }
  });

  it("keeps grading correct when the display order is shuffled", () => {
    for (const question of QUIZ_QUESTIONS.slice(0, 40)) {
      const presented = presentQuestion(question);
      expect(presented.displayChoices).toHaveLength(4);
      expect(new Set(presented.displayChoices.map((c) => c.id)).size).toBe(4);
      const key = presented.displayChoices.find(
        (c) => c.id === question.correctChoiceId,
      );
      expect(key).toBeDefined();
    }
  });

  it("round-trips a study configuration through the URL", () => {
    const url = buildQuizUrl({
      mode: "section",
      sections: [2, 5],
      difficulty: "hard",
      count: 20,
      order: "random",
      tag: "pubs",
      questionType: "debugging",
    });
    const parsed = parseStudyConfig(new URLSearchParams(url.split("?")[1]));
    expect(parsed.sections).toEqual([2, 5]);
    expect(parsed.difficulty).toBe("hard");
    expect(parsed.count).toBe(20);
    expect(parsed.order).toBe("random");
    expect(parsed.tag).toBe("pubs");
    expect(parsed.questionType).toBe("debugging");
  });

  it("parses retry ids", () => {
    expect(parseRetryIds(new URLSearchParams("retry=s1-001,s2-002"))).toEqual([
      "s1-001",
      "s2-002",
    ]);
    expect(parseRetryIds(new URLSearchParams(""))).toEqual([]);
  });
});
